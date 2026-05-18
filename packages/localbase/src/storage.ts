import { Hono } from 'hono'
import type { Context } from 'hono'
import { extname } from 'path'
import type { StorageAdapter } from './storage-adapter.ts'
import { MIME } from './storage-adapter.ts'

// Resolve which project a request belongs to.
// Exported so server.ts can share the same resolver.
export type ProjectResolver = (c: Context) => string

export function createStorageRoutes(adapter: StorageAdapter, getProjectId: ProjectResolver): Hono {
  const app = new Hono()

  app.get('/:bucket', async (c) => {
    const projectId = getProjectId(c)
    const bucket = c.req.param('bucket')
    try {
      const files = await adapter.list(projectId, bucket)
      return c.json({ data: files })
    } catch (err: any) {
      return c.json({ error: { code: 'STORAGE_ERROR', message: err.message } }, 400)
    }
  })

  app.get('/:bucket/:path{.+}', async (c) => {
    const projectId = getProjectId(c)
    const bucket = c.req.param('bucket')
    const path = c.req.param('path')
    try {
      const res = await adapter.serve(projectId, bucket, path)
      if (!res) return c.json({ error: { code: 'NOT_FOUND', message: 'file not found' } }, 404)
      return res
    } catch {
      return c.json({ error: { code: 'INVALID_PATH', message: 'invalid path' } }, 400)
    }
  })

  app.put('/:bucket/:path{.+}', async (c) => {
    const projectId = getProjectId(c)
    const bucket = c.req.param('bucket')
    const path = c.req.param('path')
    const buffer = await c.req.arrayBuffer()
    const contentType = c.req.header('Content-Type') ?? MIME[extname(path).toLowerCase()] ?? 'application/octet-stream'
    try {
      const { url } = await adapter.upload(projectId, bucket, path, buffer, contentType)
      return c.json({ data: { bucket, path, size: buffer.byteLength, url } }, 201)
    } catch (err: any) {
      return c.json({ error: { code: 'STORAGE_ERROR', message: err.message } }, 400)
    }
  })

  app.delete('/:bucket/:path{.+}', async (c) => {
    const projectId = getProjectId(c)
    const bucket = c.req.param('bucket')
    const path = c.req.param('path')
    try {
      const deleted = await adapter.delete(projectId, bucket, path)
      if (!deleted) return c.json({ error: { code: 'NOT_FOUND', message: 'file not found' } }, 404)
      return c.json({ data: { bucket, path } })
    } catch {
      return c.json({ error: { code: 'INVALID_PATH', message: 'invalid path' } }, 400)
    }
  })

  return app
}
