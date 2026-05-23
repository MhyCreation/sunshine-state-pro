import type { LBConfig, StorageConfig } from './types.ts'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const DEFAULTS: LBConfig = {
  port: 7700,
  dataDir: '.localbase',
  jwtSecret: 'change-me-in-production-use-a-long-random-string',
}

export function loadConfig(configPath?: string): LBConfig {
  const envSecret    = process.env['LB_JWT_SECRET']
  const envPort      = process.env['LB_PORT'] ? parseInt(process.env['LB_PORT'], 10) : undefined
  const envDataDir   = process.env['LB_DATA_DIR']
  const envApiKey    = process.env['LB_API_KEY']

  const envStorageType = process.env['LB_STORAGE_TYPE'] as StorageConfig['type'] | undefined
  const envS3Endpoint  = process.env['LB_S3_ENDPOINT']
  const envS3Region    = process.env['LB_S3_REGION']
  const envS3Bucket    = process.env['LB_S3_BUCKET']
  const envS3AccessKey = process.env['LB_S3_ACCESS_KEY']
  const envS3SecretKey = process.env['LB_S3_SECRET_KEY']

  const path = configPath ?? join(process.cwd(), 'localbase.config.json')
  let fileConfig: Partial<LBConfig> = {}

  if (existsSync(path)) {
    try {
      fileConfig = JSON.parse(readFileSync(path, 'utf-8'))
    } catch (err: any) {
      console.warn(`[localbase] Could not parse ${path}: ${err.message}`)
    }
  }

  let storageConfig: StorageConfig | undefined = fileConfig.storage
  if (envStorageType) {
    storageConfig = {
      type:            envStorageType,
      endpoint:        envS3Endpoint    ?? storageConfig?.endpoint,
      region:          envS3Region      ?? storageConfig?.region ?? 'auto',
      bucket:          envS3Bucket      ?? storageConfig?.bucket,
      accessKeyId:     envS3AccessKey   ?? storageConfig?.accessKeyId,
      secretAccessKey: envS3SecretKey   ?? storageConfig?.secretAccessKey,
    }
  }

  return {
    ...DEFAULTS,
    ...fileConfig,
    ...(envSecret      && { jwtSecret: envSecret }),
    ...(envPort        && { port: envPort }),
    ...(envDataDir     && { dataDir: envDataDir }),
    ...(envApiKey      && { apiKey: envApiKey }),
    ...(storageConfig  && { storage: storageConfig }),
  }
}
