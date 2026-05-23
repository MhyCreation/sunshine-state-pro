import { join } from 'path'
import { DB } from './db.ts'
import { initAuthSchema } from './auth.ts'
import { runMigrations } from './migrations.ts'
import type { LBConfig } from './types.ts'

export class ProjectDbCache {
  #dbs = new Map<string, DB>()

  // Return (or lazily create) the DB for a given project.
  // "default" maps to the legacy single-DB path for backwards compat.
  get(projectId: string, config: LBConfig): DB {
    const cached = this.#dbs.get(projectId)
    if (cached) return cached

    const dbPath = projectId === 'default'
      ? join(process.cwd(), config.dataDir, 'data.db')
      : join(process.cwd(), config.dataDir, 'projects', projectId, 'data.db')

    const db = new DB({ dbPath })
    initAuthSchema(db)

    // Run app migrations only for the default project (they are app-specific).
    // Named projects manage their own schema via Studio or the migration API.
    if (projectId === 'default') {
      runMigrations(db, config)
    }

    this.#dbs.set(projectId, db)
    return db
  }

  // Evict a project's DB instance (e.g. after deletion)
  evict(projectId: string): void {
    this.#dbs.delete(projectId)
  }
}
