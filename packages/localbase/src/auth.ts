import { Hono } from 'hono'
import { SignJWT, jwtVerify } from 'jose'
import { hash, compare } from 'bcryptjs'
import type { DB } from './db.ts'
import type { LBConfig, AuthUser } from './types.ts'

const SALT_ROUNDS = 12
const ACCESS_TOKEN_TTL_SECS = 15 * 60       // 15 min
const REFRESH_TOKEN_TTL_SECS = 30 * 24 * 3600 // 30 days

function secret(config: LBConfig): Uint8Array {
  return new TextEncoder().encode(config.jwtSecret)
}

export function initAuthSchema(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id           TEXT PRIMARY KEY,
      email        TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role         TEXT NOT NULL DEFAULT 'user',
      metadata     TEXT NOT NULL DEFAULT '{}',
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      refresh_token TEXT NOT NULL UNIQUE,
      expires_at    TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_auth_sessions_user  ON auth_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(refresh_token);
  `)
}

export async function createAccessToken(user: AuthUser, config: LBConfig): Promise<string> {
  return new SignJWT({ sub: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECS}s`)
    .sign(secret(config))
}

export async function verifyAccessToken(token: string, config: LBConfig): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret(config))
    return {
      id: payload.sub!,
      email: payload['email'] as string,
      role: payload['role'] as string,
      metadata: {},
      created_at: '',
    }
  } catch {
    return null
  }
}

type UserRow = {
  id: string
  email: string
  password_hash: string
  role: string
  metadata: string
  created_at: string
}

function rowToUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    metadata: JSON.parse(row.metadata),
    created_at: row.created_at,
  }
}

function newRefreshSession(db: DB, userId: string): string {
  const refreshToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECS * 1000).toISOString()
  db.run(
    'INSERT INTO auth_sessions (id, user_id, refresh_token, expires_at) VALUES (?, ?, ?, ?)',
    [crypto.randomUUID(), userId, refreshToken, expiresAt]
  )
  return refreshToken
}

export function createAuthRoutes(db: DB, config: LBConfig): Hono {
  const app = new Hono()

  app.post('/signup', async (c) => {
    const body = await c.req.json().catch(() => null)
    if (!body?.email || !body?.password) {
      return c.json({ error: { code: 'INVALID_INPUT', message: 'email and password required' } }, 400)
    }

    if (db.queryOne('SELECT id FROM auth_users WHERE email = ?', [body.email])) {
      return c.json({ error: { code: 'EMAIL_EXISTS', message: 'email already registered' } }, 409)
    }

    const id = crypto.randomUUID()
    const passwordHash = await hash(body.password, SALT_ROUNDS)
    db.run(
      'INSERT INTO auth_users (id, email, password_hash, role, metadata) VALUES (?, ?, ?, ?, ?)',
      [id, body.email, passwordHash, body.role ?? 'user', JSON.stringify(body.data ?? {})]
    )

    const user = rowToUser(db.queryOne<UserRow>('SELECT * FROM auth_users WHERE id = ?', [id])!)
    const accessToken = await createAccessToken(user, config)
    const refreshToken = newRefreshSession(db, id)

    return c.json({ data: { user, access_token: accessToken, refresh_token: refreshToken } }, 201)
  })

  app.post('/login', async (c) => {
    const body = await c.req.json().catch(() => null)
    if (!body?.email || !body?.password) {
      return c.json({ error: { code: 'INVALID_INPUT', message: 'email and password required' } }, 400)
    }

    const row = db.queryOne<UserRow>('SELECT * FROM auth_users WHERE email = ?', [body.email])
    if (!row || !(await compare(body.password, row.password_hash))) {
      return c.json({ error: { code: 'INVALID_CREDENTIALS', message: 'invalid email or password' } }, 401)
    }

    const user = rowToUser(row)
    const accessToken = await createAccessToken(user, config)
    const refreshToken = newRefreshSession(db, row.id)

    return c.json({ data: { user, access_token: accessToken, refresh_token: refreshToken } })
  })

  app.post('/refresh', async (c) => {
    const body = await c.req.json().catch(() => null)
    if (!body?.refresh_token) {
      return c.json({ error: { code: 'INVALID_INPUT', message: 'refresh_token required' } }, 400)
    }

    const session = db.queryOne<{ id: string; user_id: string; expires_at: string }>(
      'SELECT * FROM auth_sessions WHERE refresh_token = ?',
      [body.refresh_token]
    )

    if (!session || new Date(session.expires_at) < new Date()) {
      if (session) db.run('DELETE FROM auth_sessions WHERE id = ?', [session.id])
      return c.json({ error: { code: 'INVALID_TOKEN', message: 'refresh token invalid or expired' } }, 401)
    }

    const row = db.queryOne<UserRow>('SELECT * FROM auth_users WHERE id = ?', [session.user_id])
    if (!row) {
      return c.json({ error: { code: 'USER_NOT_FOUND', message: 'user not found' } }, 404)
    }

    const user = rowToUser(row)
    const newAccessToken = await createAccessToken(user, config)
    const newRefreshToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECS * 1000).toISOString()

    db.run('UPDATE auth_sessions SET refresh_token = ?, expires_at = ? WHERE id = ?', [
      newRefreshToken, expiresAt, session.id,
    ])

    return c.json({ data: { user, access_token: newAccessToken, refresh_token: newRefreshToken } })
  })

  app.post('/logout', async (c) => {
    const body = await c.req.json().catch(() => ({}))
    if (body?.refresh_token) {
      db.run('DELETE FROM auth_sessions WHERE refresh_token = ?', [body.refresh_token])
    }
    return c.json({ data: { success: true } })
  })

  app.get('/me', async (c) => {
    const header = c.req.header('Authorization')
    if (!header?.startsWith('Bearer ')) {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'Bearer token required' } }, 401)
    }

    const tokenUser = await verifyAccessToken(header.slice(7), config)
    if (!tokenUser) {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'invalid or expired token' } }, 401)
    }

    const row = db.queryOne<UserRow>('SELECT * FROM auth_users WHERE id = ?', [tokenUser.id])
    if (!row) {
      return c.json({ error: { code: 'USER_NOT_FOUND', message: 'user not found' } }, 404)
    }

    return c.json({ data: { user: rowToUser(row) } })
  })

  return app
}
