export interface LBClientConfig {
  url: string
  apiKey?: string
}

export interface AuthUser {
  id: string
  email: string
  role: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token: string
}

export interface LBResult<T> {
  data: T | null
  error: LBError | null
}

export interface LBError {
  code: string
  message: string
  details?: unknown
}

export interface RealtimeEvent<T = Record<string, unknown>> {
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: T
  old_record?: T
}

export interface StorageFile {
  bucket: string
  path: string
  size: number
  url: string
}
