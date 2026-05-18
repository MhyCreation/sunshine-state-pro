import { HttpClient } from './http.ts'
import { AuthModule } from './auth.ts'
import { TableRef } from './table.ts'
import { RealtimeClient } from './realtime.ts'
import { StorageClient } from './storage.ts'
import type { LBClientConfig } from './types.ts'

export type {
  LBClientConfig,
  AuthUser,
  AuthSession,
  LBResult,
  LBError,
  RealtimeEvent,
  StorageFile,
} from './types.ts'
export { TableQuery } from './table.ts'

export class Localbase {
  auth: AuthModule
  realtime: RealtimeClient
  storage: StorageClient
  #http: HttpClient

  constructor(config: LBClientConfig) {
    this.#http = new HttpClient(config)
    this.auth = new AuthModule(this.#http)
    const wsUrl = config.url.replace(/^http/, 'ws') + '/realtime'
    this.realtime = new RealtimeClient(wsUrl)
    this.storage = new StorageClient(this.#http)
  }

  // Get a typed table reference for CRUD + queries
  table<T = Record<string, unknown>>(name: string): TableRef<T> {
    return new TableRef<T>(this.#http, name)
  }
}

export function createLocalbase(config: LBClientConfig): Localbase {
  return new Localbase(config)
}
