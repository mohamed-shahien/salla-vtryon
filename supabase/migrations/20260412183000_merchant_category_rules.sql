-- Migration: Create merchant_category_rules table
-- Date: 2026-04-12
-- Focus: Smart Category Rules for catalog-scale widget eligibility

create table if not exists public.merchant_category_rules (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  category_id text not null,
  category_name text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchant_category_rules_unique unique (merchant_id, category_id),
  constraint merchant_category_rules_category_id_not_blank check (length(trim(category_id)) > 0)
);

create index if not exists idx_merchant_category_rules_merchant
on public.merchant_category_rules(merchant_id);

create index if not exists idx_merchant_category_rules_enabled
on public.merchant_category_rules(merchant_id, category_id)
where enabled = true;

drop trigger if exists merchant_category_rules_update_updated_at on public.merchant_category_rules;
create trigger merchant_category_rules_update_updated_at
before update on public.merchant_category_rules
for each row
execute function public.update_updated_at();

alter table public.merchant_category_rules enable row level security;

drop policy if exists "Merchants can manage their own category rules"
on public.merchant_category_rules;

create policy "Merchants can manage their own category rules"
on public.merchant_category_rules
for all
using (merchant_id = auth.uid())
with check (merchant_id = auth.uid());

create index if not exists idx_merchants_settings_selected_categories
on public.merchants
using gin ((settings -> 'display_rules' -> 'selected_category_ids'));
