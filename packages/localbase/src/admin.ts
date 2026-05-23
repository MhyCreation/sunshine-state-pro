import type { DB } from './db.ts'

export type Project = {
  id: string
  name: string
  slug: string
  api_key: string
  created_at: string
}

export function initAdminDb(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      slug       TEXT NOT NULL UNIQUE,
      api_key    TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
}

export function createProject(db: DB, name: string): Project {
  const id = crypto.randomUUID()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const api_key = `pk_live_${crypto.randomUUID().replace(/-/g, '')}`

  db.run(
    'INSERT INTO projects (id, name, slug, api_key) VALUES (?, ?, ?, ?)',
    [id, name, slug, api_key]
  )
  return db.queryOne<Project>('SELECT * FROM projects WHERE id = ?', [id])!
}

export function getProjectByApiKey(db: DB, apiKey: string): Project | null {
  return db.queryOne<Project>('SELECT * FROM projects WHERE api_key = ?', [apiKey])
}

export function listProjects(db: DB): Project[] {
  return db.query<Project>('SELECT * FROM projects ORDER BY created_at ASC')
}

export function deleteProject(db: DB, id: string): boolean {
  const result = db.run('DELETE FROM projects WHERE id = ?', [id])
  return result.changes > 0
}
