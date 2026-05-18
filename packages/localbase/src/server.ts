import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { join } from 'path'
import { DB } from './db.ts'
import { loadConfig } from './config.ts'
import { initAuthSchema, createAuthRoutes } from './auth.ts'
import { createRestRoutes } from './rest.ts'
import { createStorageRoutes } from './storage.ts'
import { createStudioApi } from './studio-api.ts'
import { runMigrations } from './migrations.ts'
import { createStorageAdapter } from './storage-adapter.ts'
import { initAdminDb, getProjectByApiKey } from './admin.ts'
import { ProjectDbCache } from './project-db.ts'
import { emit, handleWsOpen, handleWsClose, handleWsMessage } from './realtime.ts'
import type { LBConfig } from './types.ts'
import type { WsData } from './realtime.ts'
export { defineTable, setRLS } from './schema.ts'

export interface LocalbaseServer {
  app: Hono
  db: DB          // default-project DB (backwards compat)
  adminDb: DB
  config: LBConfig
  start: () => void
}

export function createServer(configPath?: string): LocalbaseServer {
  const config = loadConfig(configPath)

  // Admin DB stores the projects table
  const adminDb = new DB({ dbPath: join(process.cwd(), config.dataDir, 'admin.db') })
  initAdminDb(adminDb)

  // Per-project DB cache; the "default" project is backwards-compat single-DB mode
  const projectCache = new ProjectDbCache()
  const defaultDb = projectCache.get('default', config)

  // Storage adapter (local filesystem or S3/R2/MinIO)
  const storageAdapter = createStorageAdapter(config)

  // Resolve project DB for each request.
  // No X-Project-Key → default project (single-app mode, backwards compat).
  function resolveDb(c: Context): DB {
    const apiKey = c.req.header('X-Project-Key')
    if (!apiKey) return defaultDb
    const project = getProjectByApiKey(adminDb, apiKey)
    if (!project) {
      // Return a Response via exception-style — Hono will catch and reply
      throw Object.assign(new Error('Invalid project key'), { status: 401, code: 'INVALID_PROJECT_KEY' })
    }
    return projectCache.get(project.id, config)
  }

  // Same logic but returns the project ID string for storage routing
  function resolveProjectId(c: Context): string {
    const apiKey = c.req.header('X-Project-Key')
    if (!apiKey) return 'default'
    const project = getProjectByApiKey(adminDb, apiKey)
    if (!project) throw Object.assign(new Error('Invalid project key'), { status: 401 })
    return project.id
  }

  const app = new Hono()

  app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Project-Key'],
  }))
  app.use('*', logger())

  // Catch project-key errors thrown from route handlers
  app.onError((err: any, c) => {
    const status = err.status ?? 500
    return c.json({ error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message } }, status)
  })

  app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

  app.route('/auth',    createAuthRoutes(resolveDb, config))
  app.route('/rest',    createRestRoutes(resolveDb, config, emit))
  app.route('/storage', createStorageRoutes(storageAdapter, resolveProjectId))

  const studioHtml = join(import.meta.dir, 'studio', 'index.html')
  app.get('/studio', (c) =>
    new Response(Bun.file(studioHtml), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  )
  app.route('/studio/api', createStudioApi(defaultDb, adminDb, projectCache, config))

  function start(): void {
    Bun.serve<WsData>({
      port: config.port,
      fetch(req, server) {
        const url = new URL(req.url)
        if (url.pathname === '/realtime' && req.headers.get('Upgrade') === 'websocket') {
          const ok = server.upgrade(req, { data: { id: crypto.randomUUID(), subscriptions: new Map() } })
          return ok ? undefined : new Response('WebSocket upgrade failed', { status: 400 })
        }
        return app.fetch(req)
      },
      websocket: { open: handleWsOpen, close: handleWsClose, message: handleWsMessage },
    })

    const base = `http://localhost:${config.port}`
    console.log(`\n🌟 Localbase running`)
    console.log(`   Health:    ${base}/health`)
    console.log(`   Auth:      ${base}/auth  (add X-Project-Key header for project isolation)`)
    console.log(`   REST:      ${base}/rest/:table`)
    console.log(`   Storage:   ${base}/storage/:bucket/:path`)
    console.log(`   Realtime:  ws://localhost:${config.port}/realtime`)
    console.log(`   Studio:    ${base}/studio`)
    console.log(`   Data dir:  ${config.dataDir}`)
    console.log(`   Storage:   ${config.storage?.type ?? 'local'}\n`)
  }

  return { app, db: defaultDb, adminDb, config, start }
}
