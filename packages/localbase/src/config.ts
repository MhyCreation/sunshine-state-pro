import type { LBConfig } from './types.ts'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const DEFAULTS: LBConfig = {
  port: 7700,
  dataDir: '.localbase',
  // This default is only for dev; override via config file or LB_JWT_SECRET env var
  jwtSecret: 'change-me-in-production-use-a-long-random-string',
}

export function loadConfig(configPath?: string): LBConfig {
  const envSecret = process.env['LB_JWT_SECRET']
  const envPort = process.env['LB_PORT'] ? parseInt(process.env['LB_PORT'], 10) : undefined
  const envDataDir = process.env['LB_DATA_DIR']
  const envApiKey = process.env['LB_API_KEY']

  const path = configPath ?? join(process.cwd(), 'localbase.config.json')
  let fileConfig: Partial<LBConfig> = {}

  if (existsSync(path)) {
    try {
      fileConfig = JSON.parse(readFileSync(path, 'utf-8'))
    } catch (err: any) {
      console.warn(`[localbase] Could not parse ${path}: ${err.message}`)
    }
  }

  return {
    ...DEFAULTS,
    ...fileConfig,
    ...(envSecret && { jwtSecret: envSecret }),
    ...(envPort && { port: envPort }),
    ...(envDataDir && { dataDir: envDataDir }),
    ...(envApiKey && { apiKey: envApiKey }),
  }
}
