import { Database, type SQLQueryBindings } from 'bun:sqlite'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import type { LBConfig } from './types.ts'

export class DB {
  #db: Database

  // Accept either a server config (uses dataDir/data.db) or an explicit file path
  constructor(source: LBConfig | { dbPath: string }) {
    let dbPath: string
    if ('dbPath' in source) {
      dbPath = source.dbPath
      mkdirSync(dirname(dbPath), { recursive: true })
    } else {
      const dir = join(process.cwd(), source.dataDir)
      mkdirSync(dir, { recursive: true })
      dbPath = join(dir, 'data.db')
    }
    this.#db = new Database(dbPath, { create: true })
    this.#db.exec('PRAGMA journal_mode=WAL;')
    this.#db.exec('PRAGMA foreign_keys=ON;')
  }

  exec(sql: string): void {
    this.#db.exec(sql)
  }

  query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
    return this.#db.prepare(sql).all(...(params as SQLQueryBindings[])) as T[]
  }

  queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | null {
    return (this.#db.prepare(sql).get(...(params as SQLQueryBindings[])) as T) ?? null
  }

  run(sql: string, params: unknown[] = []): { changes: number; lastInsertRowid: number | bigint } {
    const result = this.#db.prepare(sql).run(...(params as SQLQueryBindings[]))
    return { changes: result.changes, lastInsertRowid: result.lastInsertRowid }
  }

  transaction<T>(fn: () => T): T {
    return this.#db.transaction(fn)()
  }
}
