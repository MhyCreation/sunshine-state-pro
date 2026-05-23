-- Sunshine State Pro — business schema (SQLite port of supabase/migrations/0001)
-- Enums become TEXT columns; uuid defaults are handled in the application layer;
-- auth.users references become auth_users(id) (created by localbase core).

CREATE TABLE IF NOT EXISTS businesses (
  id                     TEXT PRIMARY KEY,
  name                   TEXT NOT NULL,
  slug                   TEXT NOT NULL UNIQUE,
  industry               TEXT NOT NULL DEFAULT 'other',
  logo_url               TEXT,
  brand_color            TEXT DEFAULT '#0A1834',
  phone                  TEXT,
  email                  TEXT,
  website                TEXT,
  address                TEXT,
  city                   TEXT,
  state                  TEXT DEFAULT 'FL',
  zip                    TEXT,
  timezone               TEXT NOT NULL DEFAULT 'America/New_York',
  subscription_tier      TEXT NOT NULL DEFAULT 'trial',
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at          TEXT DEFAULT (datetime('now', '+14 days')),
  created_at             TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);

CREATE TABLE IF NOT EXISTS business_members (
  id          TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'employee',
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  hourly_rate REAL,
  is_active   INTEGER NOT NULL DEFAULT 1,
  invited_at  TEXT,
  joined_at   TEXT DEFAULT (datetime('now')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (business_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_members_user     ON business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_business ON business_members(business_id);

CREATE TABLE IF NOT EXISTS customers (
  id              TEXT PRIMARY KEY,
  business_id     TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  zip             TEXT,
  notes           TEXT,
  tags            TEXT DEFAULT '[]',
  status          TEXT NOT NULL DEFAULT 'lead',
  ai_summary      TEXT,
  lifetime_value  REAL DEFAULT 0,
  last_service_at TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_customers_business ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_status   ON customers(business_id, status);

CREATE TABLE IF NOT EXISTS jobs (
  id              TEXT PRIMARY KEY,
  business_id     TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id     TEXT REFERENCES customers(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  service_type    TEXT,
  status          TEXT NOT NULL DEFAULT 'quoted',
  scheduled_start TEXT,
  scheduled_end   TEXT,
  actual_start    TEXT,
  actual_end      TEXT,
  address         TEXT,
  lat             REAL,
  lng             REAL,
  estimated_price REAL,
  final_price     REAL,
  is_recurring    INTEGER DEFAULT 0,
  recurrence_rule TEXT,
  parent_job_id   TEXT REFERENCES jobs(id) ON DELETE SET NULL,
  created_by      TEXT REFERENCES auth_users(id),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_jobs_business  ON jobs(business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer  ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled ON jobs(business_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_jobs_status    ON jobs(business_id, status);

CREATE TABLE IF NOT EXISTS invoices (
  id                TEXT PRIMARY KEY,
  business_id       TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id       TEXT NOT NULL REFERENCES customers(id),
  job_id            TEXT REFERENCES jobs(id) ON DELETE SET NULL,
  invoice_number    TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'draft',
  subtotal          REAL NOT NULL DEFAULT 0,
  tax_rate          REAL DEFAULT 0,
  tax_amount        REAL DEFAULT 0,
  discount_amount   REAL DEFAULT 0,
  total             REAL NOT NULL DEFAULT 0,
  amount_paid       REAL NOT NULL DEFAULT 0,
  due_date          TEXT,
  sent_at           TEXT,
  paid_at           TEXT,
  stripe_invoice_id TEXT,
  pdf_url           TEXT,
  notes             TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (business_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_business ON invoices(business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status   ON invoices(business_id, status);

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id          TEXT PRIMARY KEY,
  invoice_id  TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    REAL NOT NULL DEFAULT 1,
  unit_price  REAL NOT NULL,
  amount      REAL NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_line_items_invoice ON invoice_line_items(invoice_id);
