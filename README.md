# Sunshine State Pro

The operating system for local service businesses — cleaning, Airbnb turnovers, pressure washing, mobile detailing, landscaping, and contractors. AI-powered booking, CRM, invoicing, and crew management.

This repo is **Phase 1**: the architectural foundation. It boots, it's pretty, it's multi-tenant from day one, and it's ready for you to extend.

## What's in Phase 1

- ✅ Next.js 15 (App Router) + React 19 + TypeScript
- ✅ Tailwind CSS v3 with the Sunshine design system (navy + gold)
- ✅ Supabase: Auth + Postgres + Row Level Security
- ✅ Multi-tenant schema with 13 tables and RLS policies on every one
- ✅ Marketing landing page (hero, features, pricing, FAQ, CTA)
- ✅ Auth flow (signup with business creation, login, logout)
- ✅ Dashboard shell with sidebar, KPI cards, revenue chart, AI insights panel, today's schedule
- ✅ Zustand store, Zod schemas, server actions pattern
- ✅ Middleware-based session refresh and route protection

## What's NOT in Phase 1 (deferred to later phases)

These are stubbed routes or empty modules — wired into the nav but not implemented:
- Booking system / calendar
- CRM (customer pipeline, segments, tags)
- Invoicing & Stripe billing
- OpenAI integration
- Twilio / Resend notifications
- Google Maps & route optimization
- Employee management & GPS check-in
- Customer portal
- React Native mobile app
- Automation engine
- Admin super panel

The schema for these IS in place — so when we build the features, we already have the data layer.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, Server Actions) |
| UI | Tailwind CSS v3, shadcn-style primitives, Framer Motion |
| Auth | Supabase Auth (SSR helpers) |
| DB | Supabase Postgres + RLS |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |

## Setup

```bash
# 1. Install
pnpm install

# 2. Spin up Supabase (or use a hosted project)
# If using Supabase CLI locally:
supabase init
supabase start
supabase db reset   # runs all migrations in supabase/migrations/

# Or paste the SQL in supabase/migrations/ into your hosted project's SQL editor.

# 3. Env vars — copy .env.example to .env.local and fill in
cp .env.example .env.local

# 4. Run
pnpm dev
```

Visit http://localhost:3000.

## Environment variables

See `.env.example`. Only Supabase keys are required for Phase 1. Stripe, OpenAI, Twilio, Resend, and Google Maps keys are listed but unused until later phases.

## Project structure

```
src/
  app/
    (marketing)/        ← public landing page
    (auth)/             ← login, signup
    (dashboard)/        ← protected app shell
  components/
    ui/                 ← buttons, cards, inputs (shadcn-style)
    marketing/          ← landing page sections
    dashboard/          ← sidebar, kpi cards, charts
  lib/
    supabase/           ← server, client, middleware factories
    schemas.ts          ← Zod validation schemas
    store.ts            ← Zustand global state
    utils.ts            ← cn() helper etc.
supabase/
  migrations/
    0001_initial_schema.sql   ← all tables
    0002_rls_policies.sql     ← RLS for multi-tenancy
middleware.ts           ← session refresh on every request
```

## Multi-tenant model

Every row in every business-data table has a `business_id` foreign key. RLS policies enforce that the authenticated user can only see/touch rows where they're a member of that business (via the `business_members` join table). One user can belong to multiple businesses; they pick the active one in the UI.

The `auth.uid()` Supabase function is used inside every policy — no app-level filtering is required, the database refuses to return other tenants' data even if a query forgets to filter.

## Roles

`business_members.role` is one of: `owner`, `admin`, `manager`, `employee`. Customers are their own table (`customers`) and not part of `business_members`.

## Next steps

When you're ready, ask for **Phase 2** and we'll build:
1. Booking system with the drag-drop calendar
2. CRM with customer pipeline
3. Job lifecycle (quoted → scheduled → in progress → completed → invoiced)

Don't ask for everything at once — let's keep each phase small enough that the code is genuinely production-grade rather than scaffolding.
