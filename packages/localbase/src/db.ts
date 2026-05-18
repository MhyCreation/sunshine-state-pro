import { Database, type SQLQueryBindings } from 'bun:sqlite'
import { mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import type { LBConfig } from './types.ts'

export class DB {
  #db: Database

  constructor(config: LBConfig) {
    const dir = join(process.cwd(), config.dataDir)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    this.#db = new Database(join(dir, 'data.db'), { create: true })
    // WAL mode for concurrent reads; enforce FK constraints
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
