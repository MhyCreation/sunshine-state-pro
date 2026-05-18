#!/usr/bin/env bun
import { createServer } from './server.ts'

const command = process.argv[2] ?? 'start'

switch (command) {
  case 'start': {
    const server = createServer()
    server.start()
    break
  }

  case 'migrate': {
    const { DB } = await import('./db.ts')
    const { loadConfig } = await import('./config.ts')
    const { initAuthSchema } = await import('./auth.ts')
    const { runMigrations } = await import('./migrations.ts')

    const config = loadConfig()
    const db = new DB(config)
    initAuthSchema(db)
    runMigrations(db, config)
    process.exit(0)
    break
  }

  case 'help':
  default:
    console.log(`
localbase — local-first backend platform

Usage:
  bun src/cli.ts [command]

Commands:
  start     Start the server (default)
  migrate   Run pending SQL migrations and exit

Config:
  localbase.config.json in the project root, or env vars:
    LB_PORT         Server port (default: 7700)
    LB_DATA_DIR     Data directory (default: .localbase)
    LB_JWT_SECRET   JWT signing secret
    LB_API_KEY      Optional API key for requests
`)
    if (command !== 'help') process.exit(1)
}
