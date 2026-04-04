create extension if not exists pgcrypto;

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  salla_merchant_id bigint unique not null,
  store_name text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  plan text not null default 'free',
  plan_status text not null default 'active',
  is_active boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  installed_at timestamptz not null default now(),
  uninstalled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchants_plan_check check (plan in ('free', 'trial', 'basic', 'professional', 'enterprise', 'diamond')),
  constraint merchants_plan_status_check check (plan_status in ('active', 'inactive'))
);

create table if not exists public.credits (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  total_credits integer not null default 0,
  used_credits integer not null default 0,
  reset_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint credits_total_nonnegative check (total_credits >= 0),
  constraint credits_used_nonnegative check (used_credits >= 0),
  constraint credits_merchant_unique unique (merchant_id)
);

create table if not exists public.tryon_jobs (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  status text not null default 'pending',
  user_image_url text not null,
  product_image_url text not null,
  product_id text,
  category text not null default 'upper_body',
  result_image_url text,
  replicate_prediction_id text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  processing_started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tryon_jobs_status_check check (status in ('pending', 'processing', 'completed', 'failed', 'canceled')),
  constraint tryon_jobs_category_check check (category in ('upper_body', 'lower_body', 'dresses'))
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique not null,
  event_name text not null,
  merchant_id bigint,
  payload jsonb,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  amount integer not null,
  type text not null,
  reason text,
  job_id uuid references public.tryon_jobs(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint credit_transactions_type_check check (type in ('debit', 'credit', 'refund', 'reset'))
);

create index if not exists idx_merchants_salla on public.merchants(salla_merchant_id);
create index if not exists idx_merchants_active on public.merchants(is_active) where is_active = true;
create index if not exists idx_jobs_status on public.tryon_jobs(status) where status in ('pending', 'processing');
create index if not exists idx_jobs_merchant on public.tryon_jobs(merchant_id);
create index if not exists idx_jobs_created on public.tryon_jobs(created_at desc);
create index if not exists idx_webhook_event_id on public.webhook_events(event_id);
create index if not exists idx_webhook_processed on public.webhook_events(processed) where processed = false;
create index if not exists idx_credit_tx_merchant on public.credit_transactions(merchant_id);

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists merchants_update_updated_at on public.merchants;
create trigger merchants_update_updated_at
before update on public.merchants
for each row
execute function public.update_updated_at();

drop trigger if exists credits_update_updated_at on public.credits;
create trigger credits_update_updated_at
before update on public.credits
for each row
execute function public.update_updated_at();

drop trigger if exists tryon_jobs_update_updated_at on public.tryon_jobs;
create trigger tryon_jobs_update_updated_at
before update on public.tryon_jobs
for each row
execute function public.update_updated_at();

alter table public.merchants enable row level security;
alter table public.credits enable row level security;
alter table public.tryon_jobs enable row level security;
alter table public.webhook_events enable row level security;
alter table public.credit_transactions enable row level security;

create or replace function public.deduct_credit(p_merchant_id uuid, p_job_id uuid)
returns boolean
language plpgsql
as $$
declare
  current_credits public.credits%rowtype;
begin
  select *
  into current_credits
  from public.credits
  where merchant_id = p_merchant_id
  for update;

  if not found then
    return false;
  end if;

  if current_credits.total_credits - current_credits.used_credits < 1 then
    return false;
  end if;

  update public.credits
  set used_credits = used_credits + 1
  where merchant_id = p_merchant_id;

  insert into public.credit_transactions (merchant_id, amount, type, reason, job_id)
  values (p_merchant_id, -1, 'debit', 'Try-on job created', p_job_id);

  return true;
end;
$$;

create or replace function public.refund_credit(p_merchant_id uuid, p_job_id uuid)
returns void
language plpgsql
as $$
begin
  update public.credits
  set used_credits = greatest(used_credits - 1, 0)
  where merchant_id = p_merchant_id;

  insert into public.credit_transactions (merchant_id, amount, type, reason, job_id)
  values (p_merchant_id, 1, 'refund', 'Job failed - credit refunded', p_job_id);
end;
$$;
