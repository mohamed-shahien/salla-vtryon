-- Migration: Create auth system schema
-- Date: 2026-04-06

-- Users table (actor identity)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Merchant Users table (tenancy mapping)
create table if not exists public.merchant_users (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchant_users_unique unique (merchant_id, user_id)
);

-- Auth Tokens table (one-time tokens for set/reset password)
create table if not exists public.auth_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token text unique not null,
  type text not null, -- 'set-password', 'reset-password', 'magic-link'
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- Audit Events table (security audit log)
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references public.merchants(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  event_type text not null,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Indices for performance
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_merchant_users_merchant on public.merchant_users(merchant_id);
create index if not exists idx_merchant_users_user on public.merchant_users(user_id);
create index if not exists idx_auth_tokens_token on public.auth_tokens(token);
create index if not exists idx_audit_events_merchant on public.audit_events(merchant_id);
create index if not exists idx_audit_events_user on public.audit_events(user_id);
create index if not exists idx_audit_events_created on public.audit_events(created_at desc);

-- Triggers for updated_at
create trigger users_update_updated_at
before update on public.users
for each row
execute function public.update_updated_at();

create trigger merchant_users_update_updated_at
before update on public.merchant_users
for each row
execute function public.update_updated_at();

-- RLS
alter table public.users enable row level security;
alter table public.merchant_users enable row level security;
alter table public.auth_tokens enable row level security;
alter table public.audit_events enable row level security;

-- Policies
create policy "Users can look up their own profile"
on public.users
for select
using (id = auth.uid());

create policy "Users can see their own merchant mappings"
on public.merchant_users
for select
using (user_id = auth.uid());
