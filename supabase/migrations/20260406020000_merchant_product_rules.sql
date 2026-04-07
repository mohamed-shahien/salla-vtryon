-- Migration: Create merchant_product_rules table
-- Date: 2026-04-06

create table if not exists public.merchant_product_rules (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  product_id bigint not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchant_product_rules_unique unique (merchant_id, product_id)
);

-- Index for fast lookup by merchant
create index if not exists idx_merchant_product_rules_merchant on public.merchant_product_rules(merchant_id);

-- Trigger for updated_at
create trigger merchant_product_rules_update_updated_at
before update on public.merchant_product_rules
for each row
execute function public.update_updated_at();

-- RLS
alter table public.merchant_product_rules enable row level security;

-- Policy: merchants can only see/edit their own rules
create policy "Merchants can manage their own product rules"
on public.merchant_product_rules
for all
using (merchant_id = auth.uid())
with check (merchant_id = auth.uid());

-- Cleanup legacy settings (optional, but good for consistency)
-- comment: onboarding_completed will be added to settings JSONB via application logic
