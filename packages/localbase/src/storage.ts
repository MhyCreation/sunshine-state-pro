import { Hono } from 'hono'
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join, extname } from 'path'
import type { LBConfig } from './types.ts'

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
}

export function createStorageRoutes(config: LBConfig): Hono {
  const app = new Hono()
  const root = join(process.cwd(), config.dataDir, 'storage')

  function filePath(bucket: string, path: string): string {
    // Sanitize: reject path traversal
    const resolved = join(root, bucket, path)
    if (!resolved.startsWith(join(root, bucket))) {
      throw new Error('invalid path')
    }
    return resolved
  }

  // List files in a bucket
  app.get('/:bucket', (c) => {
    const bucket = c.req.param('bucket')
    const bucketDir = join(root, bucket)

    if (!existsSync(bucketDir)) return c.json({ data: [] })

    function walk(dir: string, prefix = ''): Array<{ name: string; path: string; size: number }> {
      return readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry)
        const stat = statSync(full)
        return stat.isDirectory()
          ? walk(full, `${prefix}${entry}/`)
          : [{ name: entry, path: `${prefix}${entry}`, size: stat.size }]
      })
    }

    return c.json({ data: walk(bucketDir) })
  })

  // Serve a file — named wildcard captures nested paths (e.g. folder/image.png)
  app.get('/:bucket/:path{.+}', (c) => {
    const bucket = c.req.param('bucket')
    const path = c.req.param('path')

    let fp: string
    try {
      fp = filePath(bucket, path)
    } catch {
      return c.json({ error: { code: 'INVALID_PATH', message: 'invalid path' } }, 400)
    }

    if (!existsSync(fp)) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'file not found' } }, 404)
    }

    const file = Bun.file(fp)
    const contentType = MIME[extname(fp).toLowerCase()] ?? 'application/octet-stream'
    return new Response(file, { headers: { 'Content-Type': contentType } })
  })

  // Upload a file
  app.put('/:bucket/:path{.+}', async (c) => {
    const bucket = c.req.param('bucket')
    const path = c.req.param('path')

    let fp: string
    try {
      fp = filePath(bucket, path)
    } catch {
      return c.json({ error: { code: 'INVALID_PATH', message: 'invalid path' } }, 400)
    }

    const dir = fp.substring(0, fp.lastIndexOf('/'))
    mkdirSync(dir, { recursive: true })

    const buffer = await c.req.arrayBuffer()
    await Bun.write(fp, buffer)

    return c.json({
      data: { bucket, path, size: buffer.byteLength, url: `/storage/${bucket}/${path}` },
    }, 201)
  })

  // Delete a file
  app.delete('/:bucket/:path{.+}', (c) => {
    const bucket = c.req.param('bucket')
    const path = c.req.param('path')

    let fp: string
    try {
      fp = filePath(bucket, path)
    } catch {
      return c.json({ error: { code: 'INVALID_PATH', message: 'invalid path' } }, 400)
    }

    if (!existsSync(fp)) {
      return c.json({ error: { code: 'NOT_FOUND', message: 'file not found' } }, 404)
    }

    unlinkSync(fp)
    return c.json({ data: { bucket, path } })
  })

  return app
}
