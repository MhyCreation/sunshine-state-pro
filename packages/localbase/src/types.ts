export interface StorageConfig {
  type: 'local' | 's3'
  endpoint?: string       // R2/MinIO/custom S3 endpoint URL
  region?: string         // default 'auto' for R2, 'us-east-1' for AWS
  bucket?: string         // S3 bucket name
  accessKeyId?: string
  secretAccessKey?: string
}

export interface LBConfig {
  port: number
  dataDir: string
  jwtSecret: string
  apiKey?: string         // Studio admin key (X-API-Key header)
  migrationsDir?: string
  storage?: StorageConfig
}

export interface AuthUser {
  id: string
  email: string
  role: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface LBError {
  code: string
  message: string
  details?: unknown
}

export interface RealtimeEvent {
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: Record<string, unknown>
  old_record?: Record<string, unknown>
}

export interface TableSchema {
  name: string
  rls?: RLSRules
}

export interface RLSRules {
  select?: (user: AuthUser | null) => Record<string, unknown>
  insert?: (user: AuthUser | null, row: Record<string, unknown>) => boolean
  update?: (user: AuthUser | null, row: Record<string, unknown>) => boolean
  delete?: (user: AuthUser | null, row: Record<string, unknown>) => boolean
}
