import { Hono } from 'hono'
import type { Context } from 'hono'
import type { DB } from './db.ts'
import type { LBConfig, AuthUser } from './types.ts'
import { verifyAccessToken } from './auth.ts'
import { applyRLSFilter, checkRLSInsert, checkRLSUpdate, checkRLSDelete } from './schema.ts'

type EmitFn = (table: string, event: 'INSERT' | 'UPDATE' | 'DELETE', record: Record<string, unknown>, oldRecord?: Record<string, unknown>) => void

function buildWhere(filters: Record<string, unknown>, params: unknown[]): string {
  const clauses: string[] = []
  for (const [key, value] of Object.entries(filters)) {
    if (key.includes('.')) {
      const dot = key.lastIndexOf('.')
      const col = key.slice(0, dot)
      const op  = key.slice(dot + 1)
      switch (op) {
        case 'eq':    clauses.push(`"${col}" = ?`);                    params.push(value); break
        case 'neq':   clauses.push(`"${col}" != ?`);                   params.push(value); break
        case 'gt':    clauses.push(`"${col}" > ?`);                    params.push(value); break
        case 'gte':   clauses.push(`"${col}" >= ?`);                   params.push(value); break
        case 'lt':    clauses.push(`"${col}" < ?`);                    params.push(value); break
        case 'lte':   clauses.push(`"${col}" <= ?`);                   params.push(value); break
        case 'like':  clauses.push(`"${col}" LIKE ?`);                 params.push(value); break
        case 'ilike': clauses.push(`LOWER("${col}") LIKE LOWER(?)`);   params.push(value); break
        case 'is':
          clauses.push(`"${col}" IS ${value === null ? 'NULL' : '?'}`)
          if (value !== null) params.push(value)
          break
        case 'in': {
          const arr = Array.isArray(value) ? value
            : typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(Boolean) : []
          if (arr.length > 0) { clauses.push(`"${col}" IN (${arr.map(() => '?').join(',')})`); params.push(...arr) }
          break
        }
      }
    } else if (value === null) {
      clauses.push(`"${key}" IS NULL`)
    } else {
      clauses.push(`"${key}" = ?`)
      params.push(value)
    }
  }
  return clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''
}

const RESERVED = new Set(['select', 'limit', 'offset', 'order_by', 'order_dir'])

export function createRestRoutes(getDb: (c: Context) => DB, config: LBConfig, emit: EmitFn): Hono {
  const app = new Hono()

  async function resolveUser(c: Context): Promise<AuthUser | null> {
    const header = c.req.header('Authorization')
    if (!header?.startsWith('Bearer ')) return null
    return verifyAccessToken(header.slice(7), config)
  }

  app.get('/:table', async (c) => {
    const db = getDb(c)
    const table = c.req.param('table')
    const user = await resolveUser(c)
    const qs = c.req.query()
    const select = qs['select']?.split(',').map((s: string) => s.trim()) ?? ['*']
    const limit = Math.min(parseInt(qs['limit'] ?? '100', 10), 1000)
    const offset = parseInt(qs['offset'] ?? '0', 10)
    const orderBy = qs['order_by']
    const orderDir = qs['order_dir'] === 'desc' ? 'DESC' : 'ASC'
    const userFilters: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(qs)) if (!RESERVED.has(k)) userFilters[k] = v
    const params: unknown[] = []
    const where = buildWhere({ ...userFilters, ...applyRLSFilter(table, user) }, params)
    const cols = select.includes('*') ? '*' : select.map((s: string) => `"${s}"`).join(', ')
    const order = orderBy ? `ORDER BY "${orderBy}" ${orderDir}` : ''
    params.push(limit, offset)
    try {
      const rows = db.query(`SELECT ${cols} FROM "${table}" ${where} ${order} LIMIT ? OFFSET ?`, params)
      const countParams: unknown[] = []
      const countWhere = buildWhere({ ...userFilters, ...applyRLSFilter(table, user) }, countParams)
      const { count } = db.queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM "${table}" ${countWhere}`, countParams) ?? { count: 0 }
      return c.json({ data: rows, count })
    } catch (err: any) { return c.json({ error: { code: 'QUERY_ERROR', message: err.message } }, 400) }
  })

  app.get('/:table/:id', async (c) => {
    const db = getDb(c)
    const table = c.req.param('table')
    const id = c.req.param('id')
    const user = await resolveUser(c)
    const rlsParams: unknown[] = []
    const rlsWhere = buildWhere(applyRLSFilter(table, user), rlsParams)
    const extra = rlsWhere ? `AND ${rlsWhere.replace('WHERE ', '')}` : ''
    try {
      const row = db.queryOne(`SELECT * FROM "${table}" WHERE id = ? ${extra}`, [id, ...rlsParams])
      if (!row) return c.json({ error: { code: 'NOT_FOUND', message: 'record not found' } }, 404)
      return c.json({ data: row })
    } catch (err: any) { return c.json({ error: { code: 'QUERY_ERROR', message: err.message } }, 400) }
  })

  app.post('/:table', async (c) => {
    const db = getDb(c)
    const table = c.req.param('table')
    const user = await resolveUser(c)
    const body = await c.req.json().catch(() => null)
    if (!body || typeof body !== 'object' || Array.isArray(body))
      return c.json({ error: { code: 'INVALID_INPUT', message: 'body must be a JSON object' } }, 400)
    if (!checkRLSInsert(table, user, body))
      return c.json({ error: { code: 'FORBIDDEN', message: 'RLS policy denied insert' } }, 403)
    const now = new Date().toISOString()
    const row = { id: crypto.randomUUID(), created_at: now, updated_at: now, ...body }
    const keys = Object.keys(row)
    try {
      db.run(`INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`, Object.values(row))
      const inserted = db.queryOne(`SELECT * FROM "${table}" WHERE id = ?`, [row.id])!
      emit(table, 'INSERT', inserted)
      return c.json({ data: inserted }, 201)
    } catch (err: any) { return c.json({ error: { code: 'INSERT_ERROR', message: err.message } }, 400) }
  })

  app.patch('/:table/:id', async (c) => {
    const db = getDb(c)
    const table = c.req.param('table')
    const id = c.req.param('id')
    const user = await resolveUser(c)
    const body = await c.req.json().catch(() => null)
    if (!body || typeof body !== 'object' || Array.isArray(body))
      return c.json({ error: { code: 'INVALID_INPUT', message: 'body must be a JSON object' } }, 400)
    const existing = db.queryOne(`SELECT * FROM "${table}" WHERE id = ?`, [id])
    if (!existing) return c.json({ error: { code: 'NOT_FOUND', message: 'record not found' } }, 404)
    if (!checkRLSUpdate(table, user, existing))
      return c.json({ error: { code: 'FORBIDDEN', message: 'RLS policy denied update' } }, 403)
    const updates = { ...body, updated_at: new Date().toISOString() }
    delete updates.id
    const setClause = Object.keys(updates).map(k => `"${k}" = ?`).join(', ')
    try {
      db.run(`UPDATE "${table}" SET ${setClause} WHERE id = ?`, [...Object.values(updates), id])
      const updated = db.queryOne(`SELECT * FROM "${table}" WHERE id = ?`, [id])!
      emit(table, 'UPDATE', updated, existing)
      return c.json({ data: updated })
    } catch (err: any) { return c.json({ error: { code: 'UPDATE_ERROR', message: err.message } }, 400) }
  })

  app.delete('/:table/:id', async (c) => {
    const db = getDb(c)
    const table = c.req.param('table')
    const id = c.req.param('id')
    const user = await resolveUser(c)
    const existing = db.queryOne(`SELECT * FROM "${table}" WHERE id = ?`, [id])
    if (!existing) return c.json({ error: { code: 'NOT_FOUND', message: 'record not found' } }, 404)
    if (!checkRLSDelete(table, user, existing))
      return c.json({ error: { code: 'FORBIDDEN', message: 'RLS policy denied delete' } }, 403)
    try {
      db.run(`DELETE FROM "${table}" WHERE id = ?`, [id])
      emit(table, 'DELETE', existing)
      return c.json({ data: existing })
    } catch (err: any) { return c.json({ error: { code: 'DELETE_ERROR', message: err.message } }, 400) }
  })

  return app
}
