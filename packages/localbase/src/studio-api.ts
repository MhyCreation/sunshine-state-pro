import { Hono } from 'hono'
import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { hash } from 'bcryptjs'
import type { DB } from './db.ts'
import type { LBConfig } from './types.ts'

export function createStudioApi(db: DB, config: LBConfig): Hono {
  const app = new Hono()

  // Guard: if an API key is configured, require it in X-API-Key header
  app.use('*', async (c, next) => {
    if (config.apiKey) {
      const key = c.req.header('X-API-Key') ?? c.req.query()['key']
      if (key !== config.apiKey) {
        return c.json(
          { error: { code: 'FORBIDDEN', message: 'Studio API requires X-API-Key header' } },
          403
        )
      }
    }
    return next()
  })

  // ── SCHEMA ────────────────────────────────────────────────────────────────

  // List all tables
  app.get('/tables', (c) => {
    const rows = db.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )
    return c.json({ data: rows.map((r) => r.name) })
  })

  // Table detail: columns (PRAGMA table_info) + row count
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
    if (!body?.sql) {
      return c.json({ error: { code: 'INVALID_INPUT', message: 'sql field required' } }, 400)
    }

    const sql = String(body.sql).trim()

    try {
      const isQuery = /^(SELECT|WITH|PRAGMA|EXPLAIN)\s/i.test(sql)

      if (isQuery) {
        const rows = db.query(sql)
        const columns = rows.length > 0 ? Object.keys(rows[0]) : []
        return c.json({ data: { type: 'select', columns, rows, count: rows.length } })
      } else {
        const result = db.run(sql)
        return c.json({
          data: { type: 'exec', changes: result.changes, lastInsertRowid: String(result.lastInsertRowid) },
        })
      }
    } catch (err: any) {
      return c.json({ error: { code: 'SQL_ERROR', message: err.message } }, 400)
    }
  })

  // ── AUTH USERS ────────────────────────────────────────────────────────────

  app.get('/auth/users', (c) => {
    const users = db.query(
      'SELECT id, email, role, metadata, created_at FROM auth_users ORDER BY created_at DESC'
    )
    return c.json({ data: users })
  })

  app.post('/auth/users', async (c) => {
    const body = await c.req.json().catch(() => null)
    if (!body?.email || !body?.password) {
      return c.json({ error: { code: 'INVALID_INPUT', message: 'email and password required' } }, 400)
    }

    if (db.queryOne('SELECT id FROM auth_users WHERE email = ?', [body.email])) {
      return c.json({ error: { code: 'EMAIL_EXISTS', message: 'email already registered' } }, 409)
    }

    const id = crypto.randomUUID()
    const passwordHash = await hash(body.password, 12)
    db.run(
      'INSERT INTO auth_users (id, email, password_hash, role, metadata) VALUES (?, ?, ?, ?, ?)',
      [id, body.email, passwordHash, body.role ?? 'user', JSON.stringify(body.data ?? {})]
    )

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

  app.get('/storage', (c) => {
    const storageRoot = join(process.cwd(), config.dataDir, 'storage')
    if (!existsSync(storageRoot)) return c.json({ data: { buckets: [], files: [] } })

    const buckets: string[] = []
    const files: Array<{ bucket: string; path: string; size: number }> = []

    for (const entry of readdirSync(storageRoot)) {
      const full = join(storageRoot, entry)
      if (!statSync(full).isDirectory()) continue
      buckets.push(entry)

      function walk(dir: string, prefix: string): void {
        for (const f of readdirSync(dir)) {
          const fp = join(dir, f)
          const stat = statSync(fp)
          if (stat.isDirectory()) {
            walk(fp, prefix ? `${prefix}/${f}` : f)
          } else {
            files.push({ bucket: entry, path: prefix ? `${prefix}/${f}` : f, size: stat.size })
          }
        }
      }
      walk(full, '')
    }

    return c.json({ data: { buckets, files } })
  })

  return app
}
