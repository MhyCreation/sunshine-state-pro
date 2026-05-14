-- ============================================================
-- Sunshine State Pro — Initial Schema
-- ============================================================
-- Multi-tenant model: every business-data row carries business_id.
-- Auth is handled by Supabase auth.users; this schema joins to it
-- via business_members and customers.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- BUSINESSES
-- ============================================================
create type business_industry as enum (
  'cleaning', 'airbnb_turnover', 'pressure_washing',
  'mobile_detailing', 'landscaping', 'home_services',
  'contracting', 'other'
);

create type subscription_tier as enum ('trial', 'starter', 'pro', 'enterprise');

create table businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  industry business_industry not null default 'other',
  logo_url text,
  brand_color text default '#0A1834',
  phone text,
  email text,
  website text,
  address text,
  city text,
  state text default 'FL',
  zip text,
  timezone text not null default 'America/New_York',
  subscription_tier subscription_tier not null default 'trial',
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_businesses_slug on businesses(slug);
create index idx_businesses_stripe_customer on businesses(stripe_customer_id);

-- ============================================================
-- BUSINESS MEMBERS (owners, admins, managers, employees)
-- ============================================================
create type member_role as enum ('owner', 'admin', 'manager', 'employee');

create table business_members (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role not null default 'employee',
  full_name text,
  phone text,
  avatar_url text,
  hourly_rate numeric(10,2),
  is_active boolean not null default true,
  invited_at timestamptz,
  joined_at timestamptz default now(),
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create index idx_members_user on business_members(user_id);
create index idx_members_business on business_members(business_id);

-- ============================================================
-- CUSTOMERS
-- ============================================================
create type customer_status as enum ('lead', 'active', 'inactive', 'churned');

create table customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  notes text,
  tags text[] default '{}',
  status customer_status not null default 'lead',
  ai_summary text,
  lifetime_value numeric(10,2) default 0,
  last_service_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_customers_business on customers(business_id);
create index idx_customers_email on customers(business_id, email);
create index idx_customers_status on customers(business_id, status);

-- ============================================================
-- JOBS & BOOKINGS
-- ============================================================
create type job_status as enum (
  'quoted', 'scheduled', 'in_progress', 'completed', 'cancelled', 'invoiced'
);

create table jobs (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  title text not null,
  description text,
  service_type text,
  status job_status not null default 'quoted',
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  address text,
  lat numeric(9,6),
  lng numeric(9,6),
  estimated_price numeric(10,2),
  final_price numeric(10,2),
  is_recurring boolean default false,
  recurrence_rule text, -- RFC 5545 RRULE
  parent_job_id uuid references jobs(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_jobs_business on jobs(business_id);
create index idx_jobs_customer on jobs(customer_id);
create index idx_jobs_scheduled on jobs(business_id, scheduled_start);
create index idx_jobs_status on jobs(business_id, status);

create table job_assignments (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  member_id uuid not null references business_members(id) on delete cascade,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  check_in_lat numeric(9,6),
  check_in_lng numeric(9,6),
  notes text,
  created_at timestamptz not null default now(),
  unique (job_id, member_id)
);

create index idx_assignments_member on job_assignments(member_id);

-- ============================================================
-- INVOICES & PAYMENTS
-- ============================================================
create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');

create table invoices (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete restrict,
  job_id uuid references jobs(id) on delete set null,
  invoice_number text not null,
  status invoice_status not null default 'draft',
  subtotal numeric(10,2) not null default 0,
  tax_rate numeric(5,4) default 0,
  tax_amount numeric(10,2) default 0,
  discount_amount numeric(10,2) default 0,
  total numeric(10,2) not null default 0,
  amount_paid numeric(10,2) not null default 0,
  due_date date,
  sent_at timestamptz,
  paid_at timestamptz,
  stripe_invoice_id text,
  pdf_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, invoice_number)
);

create index idx_invoices_business on invoices(business_id);
create index idx_invoices_customer on invoices(customer_id);
create index idx_invoices_status on invoices(business_id, status);

create table invoice_line_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null,
  amount numeric(10,2) not null,
  position int not null default 0
);

create index idx_line_items_invoice on invoice_line_items(invoice_id);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  invoice_id uuid references invoices(id) on delete set null,
  amount numeric(10,2) not null,
  method text, -- 'card', 'cash', 'check', 'ach'
  stripe_payment_intent_id text,
  status text default 'succeeded',
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_payments_invoice on payments(invoice_id);
create index idx_payments_business on payments(business_id);

-- ============================================================
-- REVIEWS
-- ============================================================
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  job_id uuid references jobs(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  source text default 'internal', -- internal, google, yelp, facebook
  is_published boolean default true,
  created_at timestamptz not null default now()
);

create index idx_reviews_business on reviews(business_id);

-- ============================================================
-- MESSAGES (customer ↔ business, AI follow-ups)
-- ============================================================
create type message_channel as enum ('sms', 'email', 'in_app', 'ai');
create type message_direction as enum ('inbound', 'outbound');

create table messages (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  channel message_channel not null,
  direction message_direction not null,
  subject text,
  body text not null,
  sent_by uuid references auth.users(id),
  is_ai_generated boolean default false,
  twilio_sid text,
  resend_id text,
  created_at timestamptz not null default now()
);

create index idx_messages_business on messages(business_id);
create index idx_messages_customer on messages(customer_id);

-- ============================================================
-- AUTOMATION WORKFLOWS
-- ============================================================
create table automation_workflows (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  description text,
  trigger_type text not null, -- 'job_completed', 'missed_call', 'invoice_overdue', ...
  trigger_config jsonb default '{}',
  actions jsonb not null default '[]', -- array of {type, config}
  is_active boolean default true,
  last_run_at timestamptz,
  run_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_workflows_business on automation_workflows(business_id);

-- ============================================================
-- SUBSCRIPTIONS (mirror of Stripe state for fast access)
-- ============================================================
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  tier subscription_tier not null default 'trial',
  status text not null default 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ANALYTICS (daily rollups for fast dashboard)
-- ============================================================
create table analytics_daily (
  business_id uuid not null references businesses(id) on delete cascade,
  date date not null,
  revenue numeric(10,2) default 0,
  jobs_completed int default 0,
  jobs_scheduled int default 0,
  new_customers int default 0,
  invoices_sent int default 0,
  primary key (business_id, date)
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}',
  ip_address inet,
  created_at timestamptz not null default now()
);

create index idx_audit_business on audit_logs(business_id, created_at desc);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger businesses_updated before update on businesses
  for each row execute function set_updated_at();
create trigger customers_updated before update on customers
  for each row execute function set_updated_at();
create trigger jobs_updated before update on jobs
  for each row execute function set_updated_at();
create trigger invoices_updated before update on invoices
  for each row execute function set_updated_at();
create trigger workflows_updated before update on automation_workflows
  for each row execute function set_updated_at();
create trigger subscriptions_updated before update on subscriptions
  for each row execute function set_updated_at();
