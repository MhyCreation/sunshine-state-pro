import type { HttpClient } from './http.ts'
import type { LBResult } from './types.ts'

type Dir = 'asc' | 'desc'

// Fluent builder for SELECT queries
export class TableQuery<T> {
  #http: HttpClient
  #table: string
  #params: Record<string, string | number | boolean> = {}
  #select = '*'
  #limit = 100
  #offset = 0
  #orderBy?: string
  #orderDir: Dir = 'asc'

  constructor(http: HttpClient, table: string) {
    this.#http = http
    this.#table = table
  }

  select(...columns: string[]): this {
    this.#select = columns.join(',')
    return this
  }

  // Equality filter shorthand: { status: 'active' }
  // Operator filter: { 'created_at.gt': '2024-01-01', 'amount.gte': 100 }
  where(filter: Record<string, string | number | boolean | null>): this {
    for (const [k, v] of Object.entries(filter)) {
      if (v !== null) this.#params[k] = v
      // null → IS NULL handled by server via "column.is=null" — pass as string
      else this.#params[`${k}.is`] = 'null'
    }
    return this
  }

  limit(n: number): this {
    this.#limit = n
    return this
  }

  offset(n: number): this {
    this.#offset = n
    return this
  }

  order(column: string, dir: Dir = 'asc'): this {
    this.#orderBy = column
    this.#orderDir = dir
    return this
  }

  async run(): Promise<LBResult<T[]> & { count: number }> {
    const query: Record<string, string | number | boolean> = {
      select: this.#select,
      limit: this.#limit,
      offset: this.#offset,
      ...this.#params,
    }
    if (this.#orderBy) {
      query['order_by'] = this.#orderBy
      query['order_dir'] = this.#orderDir
    }

    const res = await this.#http.request<T[]>('GET', `/rest/${this.#table}`, { query })
    return { ...res, count: (res as any).count ?? 0 }
  }
}

export class TableRef<T = Record<string, unknown>> {
  #http: HttpClient
  #table: string

  constructor(http: HttpClient, table: string) {
    this.#http = http
    this.#table = table
  }

  // Start a SELECT query chain
  query(): TableQuery<T> {
    return new TableQuery<T>(this.#http, this.#table)
  }

  // Fetch a single record by id
  async get(id: string): Promise<LBResult<T>> {
    return this.#http.request<T>('GET', `/rest/${this.#table}/${id}`)
  }

  // Insert a new record; server assigns id + timestamps
  async insert(data: Partial<T>): Promise<LBResult<T>> {
    return this.#http.request<T>('POST', `/rest/${this.#table}`, { body: data })
  }

  // Update fields of an existing record by id
  async update(id: string, data: Partial<T>): Promise<LBResult<T>> {
    return this.#http.request<T>('PATCH', `/rest/${this.#table}/${id}`, { body: data })
  }

  // Delete a record by id; returns the deleted row
  async delete(id: string): Promise<LBResult<T>> {
    return this.#http.request<T>('DELETE', `/rest/${this.#table}/${id}`)
  }
}
