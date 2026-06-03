-- ============================================================
-- SunshineSpins Casino — Schema
-- ============================================================
-- Sweepstakes model: Gold Coins (GC) for fun play, Sweeps Coins (SC) earnable/redeemable.
-- Every user gets a wallet on signup via trigger.

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- WALLETS
-- ============================================================
create table if not exists wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  gold_coins bigint not null default 10000,
  sweeps_coins numeric(14, 2) not null default 2.00,
  lifetime_gc_won bigint not null default 0,
  lifetime_sc_won numeric(14, 2) not null default 0.00,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('bonus', 'bet', 'win', 'purchase', 'redemption', 'daily_login')),
  currency text not null check (currency in ('gold', 'sweeps')),
  amount numeric(14, 2) not null,
  balance_after numeric(14, 2),
  description text,
  game text check (game in ('slots', 'blackjack', 'poker', 'roulette')),
  created_at timestamptz not null default now()
);

create index idx_transactions_user on transactions(user_id, created_at desc);

-- ============================================================
-- GAME SESSIONS
-- ============================================================
create table if not exists game_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game text not null check (game in ('slots', 'blackjack', 'poker', 'roulette')),
  currency text not null check (currency in ('gold', 'sweeps')),
  bet_amount numeric(14, 2) not null,
  win_amount numeric(14, 2) not null default 0,
  result_data jsonb,
  created_at timestamptz not null default now()
);

create index idx_game_sessions_user on game_sessions(user_id, created_at desc);

-- ============================================================
-- DAILY BONUSES
-- ============================================================
create table if not exists daily_bonuses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  claimed_date date not null default current_date,
  gold_awarded bigint not null default 0,
  sweeps_awarded numeric(14, 2) not null default 0.00,
  unique (user_id, claimed_date)
);

-- ============================================================
-- AUTO-CREATE PROFILE + WALLET ON SIGNUP
-- ============================================================
create or replace function handle_new_casino_user()
returns trigger as $$
begin
  insert into profiles (id) values (new.id) on conflict do nothing;
  insert into wallets (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_casino on auth.users;
create trigger on_auth_user_created_casino
  after insert on auth.users
  for each row execute function handle_new_casino_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table wallets enable row level security;
alter table transactions enable row level security;
alter table game_sessions enable row level security;
alter table daily_bonuses enable row level security;

-- Profiles: users can read/update their own
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- Wallets: users can read their own (mutations via server-side functions only)
create policy "wallets_select_own" on wallets for select using (auth.uid() = user_id);
create policy "wallets_update_own" on wallets for update using (auth.uid() = user_id);
create policy "wallets_insert_own" on wallets for insert with check (auth.uid() = user_id);

-- Transactions: users can read/insert their own
create policy "transactions_select_own" on transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on transactions for insert with check (auth.uid() = user_id);

-- Game sessions: users can read/insert their own
create policy "game_sessions_select_own" on game_sessions for select using (auth.uid() = user_id);
create policy "game_sessions_insert_own" on game_sessions for insert with check (auth.uid() = user_id);

-- Daily bonuses: users can read/insert their own
create policy "daily_bonuses_select_own" on daily_bonuses for select using (auth.uid() = user_id);
create policy "daily_bonuses_insert_own" on daily_bonuses for insert with check (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated before update on profiles
  for each row execute function set_updated_at();
create trigger wallets_updated before update on wallets
  for each row execute function set_updated_at();
