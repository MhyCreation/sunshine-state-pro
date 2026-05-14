-- ============================================================
-- Row Level Security Policies
-- ============================================================
-- The auth.uid() function returns the authenticated user's id.
-- We use a helper function to check business membership.

create or replace function public.user_is_member_of(b_id uuid) returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from business_members
    where business_id = b_id and user_id = auth.uid() and is_active = true
  );
$$;

create or replace function public.user_has_role(b_id uuid, roles member_role[]) returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from business_members
    where business_id = b_id
      and user_id = auth.uid()
      and is_active = true
      and role = any(roles)
  );
$$;

-- ============================================================
-- BUSINESSES
-- ============================================================
alter table businesses enable row level security;

create policy "members read their business" on businesses
  for select using (user_is_member_of(id));

create policy "owners update their business" on businesses
  for update using (user_has_role(id, array['owner','admin']::member_role[]));

-- Inserting a new business is allowed for any authenticated user
-- (signup flow creates the business + owner row in one transaction).
create policy "authenticated insert" on businesses
  for insert with check (auth.uid() is not null);

-- ============================================================
-- BUSINESS MEMBERS
-- ============================================================
alter table business_members enable row level security;

create policy "members read members of their business" on business_members
  for select using (user_is_member_of(business_id));

create policy "owners insert members" on business_members
  for insert with check (
    user_has_role(business_id, array['owner','admin']::member_role[])
    -- Or it's the first member (the owner self-creating during signup)
    or not exists (select 1 from business_members where business_id = business_members.business_id)
  );

create policy "owners update members" on business_members
  for update using (user_has_role(business_id, array['owner','admin']::member_role[]));

create policy "owners delete members" on business_members
  for delete using (user_has_role(business_id, array['owner']::member_role[]));

-- ============================================================
-- Generic helper — apply RLS pattern to every business-scoped table
-- ============================================================
do $$
declare
  t text;
  tables text[] := array[
    'customers', 'jobs', 'job_assignments', 'invoices',
    'invoice_line_items', 'payments', 'reviews', 'messages',
    'automation_workflows', 'subscriptions', 'analytics_daily', 'audit_logs'
  ];
begin
  foreach t in array tables loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;

-- Direct business_id tables
create policy "members read customers" on customers
  for select using (user_is_member_of(business_id));
create policy "members write customers" on customers
  for all using (user_is_member_of(business_id))
  with check (user_is_member_of(business_id));

create policy "members read jobs" on jobs
  for select using (user_is_member_of(business_id));
create policy "members write jobs" on jobs
  for all using (user_is_member_of(business_id))
  with check (user_is_member_of(business_id));

create policy "members read invoices" on invoices
  for select using (user_is_member_of(business_id));
create policy "managers write invoices" on invoices
  for all using (user_has_role(business_id, array['owner','admin','manager']::member_role[]))
  with check (user_has_role(business_id, array['owner','admin','manager']::member_role[]));

create policy "members read payments" on payments
  for select using (user_is_member_of(business_id));
create policy "managers write payments" on payments
  for all using (user_has_role(business_id, array['owner','admin','manager']::member_role[]))
  with check (user_has_role(business_id, array['owner','admin','manager']::member_role[]));

create policy "members read reviews" on reviews
  for select using (user_is_member_of(business_id));
create policy "members write reviews" on reviews
  for all using (user_is_member_of(business_id))
  with check (user_is_member_of(business_id));

create policy "members read messages" on messages
  for select using (user_is_member_of(business_id));
create policy "members write messages" on messages
  for all using (user_is_member_of(business_id))
  with check (user_is_member_of(business_id));

create policy "members read workflows" on automation_workflows
  for select using (user_is_member_of(business_id));
create policy "admins write workflows" on automation_workflows
  for all using (user_has_role(business_id, array['owner','admin']::member_role[]))
  with check (user_has_role(business_id, array['owner','admin']::member_role[]));

create policy "members read subscriptions" on subscriptions
  for select using (user_is_member_of(business_id));
-- subscriptions are only written by Stripe webhook with service_role; no insert/update policy for users

create policy "members read analytics" on analytics_daily
  for select using (user_is_member_of(business_id));
-- analytics are written by background jobs with service_role

create policy "members read audit" on audit_logs
  for select using (business_id is null or user_has_role(business_id, array['owner','admin']::member_role[]));

-- Indirect tables (joined through job/invoice)
create policy "members read job assignments" on job_assignments
  for select using (
    exists (select 1 from jobs j where j.id = job_id and user_is_member_of(j.business_id))
  );
create policy "members write job assignments" on job_assignments
  for all using (
    exists (select 1 from jobs j where j.id = job_id and user_is_member_of(j.business_id))
  ) with check (
    exists (select 1 from jobs j where j.id = job_id and user_is_member_of(j.business_id))
  );

create policy "members read line items" on invoice_line_items
  for select using (
    exists (select 1 from invoices i where i.id = invoice_id and user_is_member_of(i.business_id))
  );
create policy "managers write line items" on invoice_line_items
  for all using (
    exists (select 1 from invoices i where i.id = invoice_id and user_has_role(i.business_id, array['owner','admin','manager']::member_role[]))
  ) with check (
    exists (select 1 from invoices i where i.id = invoice_id and user_has_role(i.business_id, array['owner','admin','manager']::member_role[]))
  );
