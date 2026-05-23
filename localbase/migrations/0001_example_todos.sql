-- Example migration: a simple todos table
-- Add your own migration files here in order: 0002_..., 0003_..., etc.
-- They run once, in filename order, and are tracked in _migrations.

CREATE TABLE IF NOT EXISTS todos (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  title      TEXT NOT NULL,
  done       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_todos_user ON todos(user_id);
