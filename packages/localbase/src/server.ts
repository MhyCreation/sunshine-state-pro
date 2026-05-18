import { Hono } from 'hono'
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
import { emit, handleWsOpen, handleWsClose, handleWsMessage } from './realtime.ts'
import type { LBConfig } from './types.ts'
import type { WsData } from './realtime.ts'
export { defineTable, setRLS } from './schema.ts'

export interface LocalbaseServer {
  app: Hono
  db: DB
  config: LBConfig
  start: () => void
}

export function createServer(configPath?: string): LocalbaseServer {
  const config = loadConfig(configPath)
  const db = new DB(config)

  initAuthSchema(db)
  runMigrations(db, config)

  const app = new Hono()

  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    })
  )
  app.use('*', logger())

  app.get('/health', (c) =>
    c.json({ status: 'ok', timestamp: new Date().toISOString() })
  )

  app.route('/auth', createAuthRoutes(db, config))
  app.route('/rest', createRestRoutes(db, config, emit))
  app.route('/storage', createStorageRoutes(config))

  // Studio UI — served at /studio, admin API at /studio/api
  const studioHtml = join(import.meta.dir, 'studio', 'index.html')
  app.get('/studio', (c) =>
    new Response(Bun.file(studioHtml), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  )
  app.route('/studio/api', createStudioApi(db, config))

  function start(): void {
    Bun.serve<WsData>({
      port: config.port,

      fetch(req, server) {
        const url = new URL(req.url)
        if (url.pathname === '/realtime' && req.headers.get('Upgrade') === 'websocket') {
          const ok = server.upgrade(req, {
            data: { id: crypto.randomUUID(), subscriptions: new Map() },
          })
          return ok ? undefined : new Response('WebSocket upgrade failed', { status: 400 })
        }
        return app.fetch(req)
      },

      websocket: {
        open: handleWsOpen,
        close: handleWsClose,
        message: handleWsMessage,
      },
    })

    const base = `http://localhost:${config.port}`
    console.log(`\n🌟 Localbase running`)
    console.log(`   Health:    ${base}/health`)
    console.log(`   Auth:      ${base}/auth`)
    console.log(`   REST:      ${base}/rest/:table`)
    console.log(`   Storage:   ${base}/storage/:bucket/:path`)
    console.log(`   Realtime:  ws://localhost:${config.port}/realtime`)
    console.log(`   Studio:    ${base}/studio`)
    console.log(`   Data dir:  ${config.dataDir}\n`)
  }

  return { app, db, config, start }
}
