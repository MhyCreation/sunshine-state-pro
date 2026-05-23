import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join, extname, dirname } from 'path'
import type { LBConfig } from './types.ts'

export const MIME: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.pdf':  'application/pdf',
  '.txt':  'text/plain',
  '.json': 'application/json',
  '.mp4':  'video/mp4',
  '.mp3':  'audio/mpeg',
  '.csv':  'text/csv',
  '.zip':  'application/zip',
}

export interface StorageAdapter {
  upload(projectId: string, bucket: string, path: string, data: ArrayBuffer, contentType: string): Promise<{ url: string }>
  serve(projectId: string, bucket: string, path: string): Promise<Response | null>
  delete(projectId: string, bucket: string, path: string): Promise<boolean>
  list(projectId: string, bucket: string): Promise<Array<{ name: string; path: string; size: number }>>
  listAll(projectId: string): Promise<{ buckets: string[]; files: Array<{ bucket: string; path: string; size: number }> }>
}

// ── Local filesystem adapter ───────────────────────────────────────────────

export class LocalStorageAdapter implements StorageAdapter {
  #root: string

  constructor(dataDir: string) {
    this.#root = join(process.cwd(), dataDir, 'storage')
  }

  #projectRoot(projectId: string): string {
    return join(this.#root, projectId)
  }

  #resolve(projectId: string, bucket: string, filePath: string): string {
    const base = join(this.#projectRoot(projectId), bucket)
    const resolved = join(base, filePath)
    if (!resolved.startsWith(base)) throw new Error('invalid path')
    return resolved
  }

  async upload(projectId: string, bucket: string, path: string, data: ArrayBuffer, _ct: string): Promise<{ url: string }> {
    const fp = this.#resolve(projectId, bucket, path)
    mkdirSync(dirname(fp), { recursive: true })
    await Bun.write(fp, data)
    return { url: `/storage/${bucket}/${path}` }
  }

  async serve(projectId: string, bucket: string, path: string): Promise<Response | null> {
    let fp: string
    try { fp = this.#resolve(projectId, bucket, path) } catch { return null }
    if (!existsSync(fp)) return null
    const contentType = MIME[extname(fp).toLowerCase()] ?? 'application/octet-stream'
    return new Response(Bun.file(fp), { headers: { 'Content-Type': contentType } })
  }

  async delete(projectId: string, bucket: string, path: string): Promise<boolean> {
    let fp: string
    try { fp = this.#resolve(projectId, bucket, path) } catch { return false }
    if (!existsSync(fp)) return false
    unlinkSync(fp)
    return true
  }

  async list(projectId: string, bucket: string): Promise<Array<{ name: string; path: string; size: number }>> {
    const bucketDir = join(this.#projectRoot(projectId), bucket)
    if (!existsSync(bucketDir)) return []

    function walk(dir: string, prefix = ''): Array<{ name: string; path: string; size: number }> {
      return readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry)
        const stat = statSync(full)
        return stat.isDirectory()
          ? walk(full, `${prefix}${entry}/`)
          : [{ name: entry, path: `${prefix}${entry}`, size: stat.size }]
      })
    }
    return walk(bucketDir)
  }

  async listAll(projectId: string): Promise<{ buckets: string[]; files: Array<{ bucket: string; path: string; size: number }> }> {
    const projectDir = this.#projectRoot(projectId)
    if (!existsSync(projectDir)) return { buckets: [], files: [] }

    const buckets: string[] = []
    const files: Array<{ bucket: string; path: string; size: number }> = []

    for (const entry of readdirSync(projectDir)) {
      const full = join(projectDir, entry)
      if (!statSync(full).isDirectory()) continue
      buckets.push(entry)
      const listed = await this.list(projectId, entry)
      files.push(...listed.map((f) => ({ bucket: entry, ...f })))
    }
    return { buckets, files }
  }
}

// ── S3-compatible adapter (R2, MinIO, AWS S3) ─────────────────────────────

export class S3StorageAdapter implements StorageAdapter {
  #endpoint: string
  #region: string
  #bucket: string
  #accessKeyId: string
  #secretAccessKey: string

  constructor(cfg: { endpoint?: string; region?: string; bucket: string; accessKeyId: string; secretAccessKey: string }) {
    this.#endpoint    = cfg.endpoint ?? `https://s3.${cfg.region ?? 'us-east-1'}.amazonaws.com`
    this.#region      = cfg.region ?? 'us-east-1'
    this.#bucket      = cfg.bucket
    this.#accessKeyId = cfg.accessKeyId
    this.#secretAccessKey = cfg.secretAccessKey
  }

  // Scoped S3 key: {projectId}/{bucket}/{path}
  #key(projectId: string, bucket: string, path: string): string {
    return `${projectId}/${bucket}/${path}`
  }

  // Minimal AWS Signature V4 HMAC-SHA256 signer using Web Crypto
  async #sign(method: string, key: string, body: ArrayBuffer | null, contentType = 'application/octet-stream'): Promise<{ url: string; headers: Record<string, string> }> {
    const now = new Date()
    const date = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
    const shortDate = date.slice(0, 8)

    const url = new URL(`${this.#endpoint}/${this.#bucket}/${encodeURIComponent(key)}`)
    const host = url.hostname

    const payloadHash = body
      ? Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', body))).map(b => b.toString(16).padStart(2, '0')).join('')
      : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

    const headers: Record<string, string> = {
      'Host': host,
      'X-Amz-Date': date,
      'X-Amz-Content-Sha256': payloadHash,
      'Content-Type': contentType,
    }

    const signedHeaders = Object.keys(headers).sort().map(k => k.toLowerCase()).join(';')
    const canonicalHeaders = Object.entries(headers).sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`).join('\n') + '\n'

    const canonicalRequest = [
      method,
      url.pathname,
      url.search.slice(1),
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n')

    const credentialScope = `${shortDate}/${this.#region}/s3/aws4_request`
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      date,
      credentialScope,
      Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)))).map(b => b.toString(16).padStart(2, '0')).join(''),
    ].join('\n')

    const hmac = async (key: ArrayBuffer, data: string): Promise<ArrayBuffer> => {
      const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data))
    }

    const enc = (s: string): ArrayBuffer => new TextEncoder().encode(s)
    const kDate    = await hmac(enc(`AWS4${this.#secretAccessKey}`), shortDate)
    const kRegion  = await hmac(kDate, this.#region)
    const kService = await hmac(kRegion, 's3')
    const kSigning = await hmac(kService, 'aws4_request')
    const signature = Array.from(new Uint8Array(await hmac(kSigning, stringToSign))).map(b => b.toString(16).padStart(2, '0')).join('')

    const authHeader = `AWS4-HMAC-SHA256 Credential=${this.#accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    return {
      url: url.toString(),
      headers: { ...headers, 'Authorization': authHeader },
    }
  }

  async upload(projectId: string, bucket: string, path: string, data: ArrayBuffer, contentType: string): Promise<{ url: string }> {
    const key = this.#key(projectId, bucket, path)
    const { url, headers } = await this.#sign('PUT', key, data, contentType)
    const res = await fetch(url, { method: 'PUT', headers, body: data })
    if (!res.ok) throw new Error(`S3 upload failed: ${res.status} ${await res.text()}`)
    return { url: `/storage/${bucket}/${path}` }
  }

  async serve(projectId: string, bucket: string, path: string): Promise<Response | null> {
    const key = this.#key(projectId, bucket, path)
    const { url, headers } = await this.#sign('GET', key, null)
    const res = await fetch(url, { headers })
    if (!res.ok) return null
    const contentType = MIME[`.${path.split('.').pop() ?? ''}`] ?? 'application/octet-stream'
    return new Response(res.body, { headers: { 'Content-Type': contentType } })
  }

  async delete(projectId: string, bucket: string, path: string): Promise<boolean> {
    const key = this.#key(projectId, bucket, path)
    const { url, headers } = await this.#sign('DELETE', key, null)
    const res = await fetch(url, { method: 'DELETE', headers })
    return res.ok || res.status === 404
  }

  async list(projectId: string, bucket: string): Promise<Array<{ name: string; path: string; size: number }>> {
    const prefix = `${projectId}/${bucket}/`
    const url = new URL(`${this.#endpoint}/${this.#bucket}`)
    url.searchParams.set('list-type', '2')
    url.searchParams.set('prefix', prefix)

    const now = new Date()
    const date = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
    const shortDate = date.slice(0, 8)
    const host = url.hostname
    const payloadHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

    const credentialScope = `${shortDate}/${this.#region}/s3/aws4_request`
    const canonicalRequest = `GET\n/${this.#bucket}\n${url.search.slice(1)}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${date}\n\nhost;x-amz-content-sha256;x-amz-date\n${payloadHash}`
    const strToSign = `AWS4-HMAC-SHA256\n${date}\n${credentialScope}\n` + Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)))).map(b => b.toString(16).padStart(2, '0')).join('')

    const enc = (s: string) => new TextEncoder().encode(s)
    const hmac = async (k: ArrayBuffer, d: string) => {
      const key = await crypto.subtle.importKey('raw', k, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      return crypto.subtle.sign('HMAC', key, enc(d))
    }
    const kDate = await hmac(enc(`AWS4${this.#secretAccessKey}`), shortDate)
    const kRegion = await hmac(kDate, this.#region)
    const kService = await hmac(kRegion, 's3')
    const kSigning = await hmac(kService, 'aws4_request')
    const sig = Array.from(new Uint8Array(await hmac(kSigning, strToSign))).map(b => b.toString(16).padStart(2, '0')).join('')

    const res = await fetch(url.toString(), {
      headers: {
        'Host': host,
        'X-Amz-Date': date,
        'X-Amz-Content-Sha256': payloadHash,
        'Authorization': `AWS4-HMAC-SHA256 Credential=${this.#accessKeyId}/${credentialScope}, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${sig}`,
      },
    })

    if (!res.ok) return []
    const xml = await res.text()
    const files: Array<{ name: string; path: string; size: number }> = []
    const matches = xml.matchAll(/<Key>([^<]+)<\/Key>.*?<Size>(\d+)<\/Size>/gs)
    for (const m of matches) {
      const rawPath = m[1].slice(prefix.length)
      if (rawPath) files.push({ name: rawPath.split('/').pop() ?? rawPath, path: rawPath, size: parseInt(m[2], 10) })
    }
    return files
  }

  async listAll(projectId: string): Promise<{ buckets: string[]; files: Array<{ bucket: string; path: string; size: number }> }> {
    const files = await this.list(projectId, '')
    const buckets = [...new Set(files.map(f => f.path.split('/')[0]).filter(Boolean))]
    return { buckets, files: files.map(f => ({ bucket: f.path.split('/')[0] ?? '', path: f.path.split('/').slice(1).join('/'), size: f.size })) }
  }
}

// ── Factory ───────────────────────────────────────────────────────────────

export function createStorageAdapter(config: LBConfig): StorageAdapter {
  if (config.storage?.type === 's3') {
    const s3 = config.storage
    if (!s3.bucket || !s3.accessKeyId || !s3.secretAccessKey) {
      throw new Error('S3 storage requires bucket, accessKeyId, and secretAccessKey in config')
    }
    return new S3StorageAdapter({
      endpoint:        s3.endpoint,
      region:          s3.region ?? 'auto',
      bucket:          s3.bucket,
      accessKeyId:     s3.accessKeyId,
      secretAccessKey: s3.secretAccessKey,
    })
  }
  return new LocalStorageAdapter(config.dataDir)
}
