import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import type { DB } from './db.ts'
import type { LBConfig } from './types.ts'

export function runMigrations(db: DB, config: LBConfig): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id          TEXT PRIMARY KEY,
      filename    TEXT NOT NULL UNIQUE,
      applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const dir = config.migrationsDir ?? join(process.cwd(), 'localbase', 'migrations')
  if (!existsSync(dir)) return

  const applied = new Set(
    db.query<{ filename: string }>('SELECT filename FROM _migrations').map((r) => r.filename)
  )

  const pending = readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .filter((f) => !applied.has(f))

  if (pending.length === 0) {
    console.log('[localbase] migrations: up to date')
    return
  }

  for (const file of pending) {
    const sql = readFileSync(join(dir, file), 'utf-8')
    try {
      db.exec(sql)
      db.run('INSERT INTO _migrations (id, filename) VALUES (?, ?)', [crypto.randomUUID(), file])
      console.log(`[localbase] migrations: applied ${file}`)
    } catch (err: any) {
      console.error(`[localbase] migrations: FAILED ${file} — ${err.message}`)
      throw err
    }
  }
}
