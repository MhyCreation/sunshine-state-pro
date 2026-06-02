-- ============================================================
-- Analytics Schema — RevenueCat + Superwall Combined
-- ============================================================

-- App registry: each business registers their mobile/web apps
create table analytics_apps (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  bundle_id text,
  platform text not null default 'all',
  sdk_key text not null default encode(gen_random_bytes(32), 'hex'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_analytics_apps_business on analytics_apps(business_id);
create unique index idx_analytics_apps_sdk_key on analytics_apps(sdk_key);

-- Paywall definitions
create table paywalls (
  id uuid primary key default uuid_generate_v4(),
  app_id uuid not null references analytics_apps(id) on delete cascade,
  name text not null,
  identifier text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (app_id, identifier)
);

create index idx_paywalls_app on paywalls(app_id);

-- A/B tests for paywalls
create table paywall_ab_tests (
  id uuid primary key default uuid_generate_v4(),
  paywall_id uuid not null references paywalls(id) on delete cascade,
  name text not null,
  variant_a_name text not null default 'Control',
  variant_b_name text not null default 'Variant B',
  start_date timestamptz not null default now(),
  end_date timestamptz,
  status text not null default 'active',
  winner text,
  created_at timestamptz not null default now()
);

create index idx_ab_tests_paywall on paywall_ab_tests(paywall_id);

-- Paywall event types
create type paywall_event_type as enum ('impression', 'conversion', 'decline', 'restore');

-- Paywall events
create table paywall_events (
  id uuid primary key default uuid_generate_v4(),
  app_id uuid not null references analytics_apps(id) on delete cascade,
  paywall_id uuid references paywalls(id) on delete set null,
  ab_test_id uuid references paywall_ab_tests(id) on delete set null,
  event_type paywall_event_type not null,
  anonymous_id text,
  ab_variant text,
  product_id text,
  revenue numeric(10,2),
  currency text default 'USD',
  country text,
  platform text,
  app_version text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_paywall_events_app on paywall_events(app_id, occurred_at desc);
create index idx_paywall_events_paywall on paywall_events(paywall_id, occurred_at desc);
create index idx_paywall_events_type on paywall_events(app_id, event_type);

-- Subscription event types
create type subscription_event_type as enum (
  'initial_purchase', 'renewal', 'cancellation', 'expiration',
  'billing_issue', 'product_change', 'refund', 'trial_start', 'trial_conversion'
);

-- Subscription lifecycle events
create table subscription_events (
  id uuid primary key default uuid_generate_v4(),
  app_id uuid not null references analytics_apps(id) on delete cascade,
  event_type subscription_event_type not null,
  anonymous_id text not null,
  product_id text not null,
  plan_name text,
  price numeric(10,2),
  currency text default 'USD',
  country text,
  platform text,
  app_version text,
  period_type text,
  is_trial boolean default false,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_sub_events_app on subscription_events(app_id, occurred_at desc);
create index idx_sub_events_type on subscription_events(app_id, event_type);
create index idx_sub_events_user on subscription_events(app_id, anonymous_id);

-- Daily revenue rollups
create table revenue_daily (
  app_id uuid not null references analytics_apps(id) on delete cascade,
  date date not null,
  new_mrr numeric(10,2) default 0,
  churned_mrr numeric(10,2) default 0,
  net_mrr numeric(10,2) default 0,
  total_mrr numeric(10,2) default 0,
  new_subscribers int default 0,
  churned_subscribers int default 0,
  total_active_subscribers int default 0,
  trial_starts int default 0,
  trial_conversions int default 0,
  gross_revenue numeric(10,2) default 0,
  refunds numeric(10,2) default 0,
  primary key (app_id, date)
);

-- RLS
alter table analytics_apps enable row level security;
alter table paywalls enable row level security;
alter table paywall_ab_tests enable row level security;
alter table paywall_events enable row level security;
alter table subscription_events enable row level security;
alter table revenue_daily enable row level security;

create or replace function get_user_business_id()
returns uuid language sql security definer stable as $$
  select business_id from business_members where user_id = auth.uid() limit 1;
$$;

create policy "members_analytics_apps" on analytics_apps for all
  using (business_id = get_user_business_id());

create policy "members_paywalls" on paywalls for all
  using (app_id in (select id from analytics_apps where business_id = get_user_business_id()));

create policy "members_ab_tests" on paywall_ab_tests for all
  using (paywall_id in (
    select id from paywalls where app_id in (
      select id from analytics_apps where business_id = get_user_business_id()
    )
  ));

create policy "members_paywall_events" on paywall_events for all
  using (app_id in (select id from analytics_apps where business_id = get_user_business_id()));

create policy "members_subscription_events" on subscription_events for all
  using (app_id in (select id from analytics_apps where business_id = get_user_business_id()));

create policy "members_revenue_daily" on revenue_daily for all
  using (app_id in (select id from analytics_apps where business_id = get_user_business_id()));

create trigger analytics_apps_updated before update on analytics_apps
  for each row execute function set_updated_at();
