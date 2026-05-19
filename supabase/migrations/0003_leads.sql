create table if not exists leads (
  id                uuid primary key default uuid_generate_v4(),
  name              text,
  email             text,
  phone             text,
  industry          text,
  source            text not null default 'landing_page',
  outreach_status   text not null default 'pending',
  outreach_sent_at  timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists idx_leads_email  on leads(email);
create index if not exists idx_leads_phone  on leads(phone);
create index if not exists idx_leads_status on leads(outreach_status);

alter table leads enable row level security;

-- Anyone (anon or authenticated) can insert a lead from the landing page
create policy "public insert leads" on leads
  for insert with check (true);

-- Only service role can read / update leads (outreach worker)
create policy "service role read leads" on leads
  for select using (auth.role() = 'service_role');

create policy "service role update leads" on leads
  for update using (auth.role() = 'service_role');
