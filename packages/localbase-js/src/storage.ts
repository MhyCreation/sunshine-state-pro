import type { HttpClient } from './http.ts'
import type { LBResult, StorageFile } from './types.ts'

export class StorageClient {
  #http: HttpClient

  constructor(http: HttpClient) {
    this.#http = http
  }

  // Build a public URL for a stored file
  url(bucket: string, path: string): string {
    return `${this.#http.baseUrl}/storage/${bucket}/${path}`
  }

  // Upload any binary data to bucket/path
  async upload(
    bucket: string,
    path: string,
    data: ArrayBuffer | Blob | File
  ): Promise<LBResult<StorageFile>> {
    const buffer = data instanceof Blob ? await data.arrayBuffer() : data
    const token = this.#http.getAccessToken()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      const res = await fetch(`${this.#http.baseUrl}/storage/${bucket}/${path}`, {
        method: 'PUT',
        headers,
        body: buffer,
      })
      const json = (await res.json()) as { data?: StorageFile; error?: any }
      if (!res.ok) return { data: null, error: json.error ?? { code: 'UPLOAD_ERROR', message: res.statusText } }
      return { data: json.data ?? null, error: null }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'network error'
      return { data: null, error: { code: 'NETWORK_ERROR', message: msg } }
    }
  }

  // List files in a bucket
  async list(bucket: string): Promise<LBResult<StorageFile[]>> {
    return this.#http.request<StorageFile[]>('GET', `/storage/${bucket}`)
  }

  // Delete a file
  async delete(bucket: string, path: string): Promise<LBResult<{ bucket: string; path: string }>> {
    return this.#http.request('DELETE', `/storage/${bucket}/${path}`)
  }
}
