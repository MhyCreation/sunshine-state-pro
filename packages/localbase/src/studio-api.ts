import { Hono } from 'hono'
import { hash } from 'bcryptjs'
import type { DB } from './db.ts'
import type { LBConfig } from './types.ts'
import type { ProjectDbCache } from './project-db.ts'
import { createProject, listProjects, deleteProject } from './admin.ts'

export function createStudioApi(
  db: DB,            // default-project DB (tables/sql/auth endpoints)
  adminDb: DB,       // master DB (projects endpoints)
  projectCache: ProjectDbCache,
  config: LBConfig
): Hono {
  const app = new Hono()

  // Guard: require X-API-Key if configured
  app.use('*', async (c, next) => {
    if (config.apiKey) {
      const key = c.req.header('X-API-Key') ?? c.req.query()['key']
      if (key !== config.apiKey)
        return c.json({ error: { code: 'FORBIDDEN', message: 'Studio API requires X-API-Key header' } }, 403)
    }
    return next()
  })

  // ── PROJECTS ──────────────────────────────────────────────────────────────

  app.get('/projects', (c) => {
    return c.json({ data: listProjects(adminDb) })
  })

  app.post('/projects', async (c) => {
    const body = await c.req.json().catch(() => null)
    if (!body?.name || typeof body.name !== 'string' || !body.name.trim())
      return c.json({ error: { code: 'INVALID_INPUT', message: 'name is required' } }, 400)
    try {
      const project = createProject(adminDb, body.name.trim())
      return c.json({ data: project }, 201)
    } catch (err: any) {
      return c.json({ error: { code: 'CREATE_ERROR', message: err.message } }, 400)
    }
  })

  app.delete('/projects/:id', (c) => {
    const id = c.req.param('id')
    const deleted = deleteProject(adminDb, id)
    if (!deleted) return c.json({ error: { code: 'NOT_FOUND', message: 'project not found' } }, 404)
    projectCache.evict(id)
    return c.json({ data: { id } })
  })

  // Run migrations on a named project
  app.post('/projects/:id/migrate', async (c) => {
    const id = c.req.param('id')
    const projects = listProjects(adminDb)
    if (!projects.find(p => p.id === id))
      return c.json({ error: { code: 'NOT_FOUND', message: 'project not found' } }, 404)
    const projectDb = projectCache.get(id, config)
    const body = await c.req.json().catch(() => null)
    if (!body?.sql || typeof body.sql !== 'string')
      return c.json({ error: { code: 'INVALID_INPUT', message: 'sql is required' } }, 400)
    try {
      projectDb.exec(body.sql)
      return c.json({ data: { success: true } })
    } catch (err: any) {
      return c.json({ error: { code: 'MIGRATION_ERROR', message: err.message } }, 400)
    }
  })

  // ── SCHEMA ────────────────────────────────────────────────────────────────

  app.get('/tables', (c) => {
    const rows = db.query<{ name: string }>("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    return c.json({ data: rows.map(r => r.name) })
  })

  app.get('/tables/:name', (c) => {
    const name = c.req.param('name')
    try {
      const columns = db.query(`PRAGMA table_info("${name}")`)
      const indexes = db.query(`PRAGMA index_list("${name}")`)
      const result = db.queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM "${name}"`)
      return c.json({ data: { name, columns, indexes, count: result?.count ?? 0 } })
    } catch (err: any) {
      return c.json({ error: { code: 'NOT_FOUND', message: err.message } }, 404)
    }
  })

  // ── SQL ───────────────────────────────────────────────────────────────────

  app.post('/sql', async (c) => {
    const body = await c.req.json().catch(() => null)
    if (!body?.sql)
      return c.json({ error: { code: 'INVALID_INPUT', message: 'sql field required' } }, 400)
    const sql = String(body.sql).trim()
    // Allow targeting a specific project's DB
    const targetDb = body.project_id ? projectCache.get(body.project_id, config) : db
    try {
      const isQuery = /^(SELECT|WITH|PRAGMA|EXPLAIN)\s/i.test(sql)
      if (isQuery) {
        const rows = targetDb.query(sql)
        const columns = rows.length > 0 ? Object.keys(rows[0]) : []
        return c.json({ data: { type: 'select', columns, rows, count: rows.length } })
      } else {
        const result = targetDb.run(sql)
        return c.json({ data: { type: 'exec', changes: result.changes, lastInsertRowid: String(result.lastInsertRowid) } })
      }
    } catch (err: any) {
      return c.json({ error: { code: 'SQL_ERROR', message: err.message } }, 400)
    }
  })

  // ── AUTH USERS ────────────────────────────────────────────────────────────

  app.get('/auth/users', (c) => {
    const users = db.query('SELECT id, email, role, metadata, created_at FROM auth_users ORDER BY created_at DESC')
    return c.json({ data: users })
  })

  app.post('/auth/users', async (c) => {
    const body = await c.req.json().catch(() => null)
    if (!body?.email || !body?.password)
      return c.json({ error: { code: 'INVALID_INPUT', message: 'email and password required' } }, 400)
    if (db.queryOne('SELECT id FROM auth_users WHERE email = ?', [body.email]))
      return c.json({ error: { code: 'EMAIL_EXISTS', message: 'email already registered' } }, 409)
    const id = crypto.randomUUID()
    const passwordHash = await hash(body.password, 12)
    db.run('INSERT INTO auth_users (id, email, password_hash, role, metadata) VALUES (?, ?, ?, ?, ?)',
      [id, body.email, passwordHash, body.role ?? 'user', JSON.stringify(body.data ?? {})])
    const user = db.queryOne('SELECT id, email, role, metadata, created_at FROM auth_users WHERE id = ?', [id])
    return c.json({ data: user }, 201)
  })

  app.delete('/auth/users/:id', (c) => {
    const id = c.req.param('id')
    const user = db.queryOne('SELECT id, email FROM auth_users WHERE id = ?', [id])
    if (!user) return c.json({ error: { code: 'NOT_FOUND', message: 'user not found' } }, 404)
    db.run('DELETE FROM auth_users WHERE id = ?', [id])
    return c.json({ data: user })
  })

  // ── STORAGE ───────────────────────────────────────────────────────────────

  app.get('/storage', async (c) => {
    // Import the adapter dynamically to avoid circular deps
    const { createStorageAdapter } = await import('./storage-adapter.ts')
    const adapter = createStorageAdapter(config)
    try {
      const result = await adapter.listAll('default')
      return c.json({ data: result })
    } catch (err: any) {
      return c.json({ error: { code: 'STORAGE_ERROR', message: err.message } }, 400)
    }
  })

  return app
}
