create or replace function public.check_credits(p_merchant_id uuid)
returns integer
language plpgsql
as $$
declare
  current_credits public.credits%rowtype;
begin
  select *
  into current_credits
  from public.credits
  where merchant_id = p_merchant_id;

  if not found then
    return 0;
  end if;

  return greatest(current_credits.total_credits - current_credits.used_credits, 0);
end;
$$;

create or replace function public.add_credits(
  p_merchant_id uuid,
  p_amount integer,
  p_reason text default 'Manual credit top-up'
)
returns void
language plpgsql
as $$
declare
  current_credits public.credits%rowtype;
begin
  if p_amount < 1 then
    raise exception 'INVALID_CREDIT_AMOUNT';
  end if;

  select *
  into current_credits
  from public.credits
  where merchant_id = p_merchant_id
  for update;

  if not found then
    raise exception 'CREDITS_RECORD_NOT_FOUND';
  end if;

  update public.credits
  set total_credits = total_credits + p_amount
  where merchant_id = p_merchant_id;

  insert into public.credit_transactions (merchant_id, amount, type, reason, job_id)
  values (p_merchant_id, p_amount, 'credit', p_reason, null);
end;
$$;

create or replace function public.reset_credits(
  p_merchant_id uuid,
  p_total_credits integer,
  p_reason text default 'Subscription credits reset'
)
returns void
language plpgsql
as $$
declare
  current_credits public.credits%rowtype;
begin
  if p_total_credits < 0 then
    raise exception 'INVALID_CREDIT_AMOUNT';
  end if;

  select *
  into current_credits
  from public.credits
  where merchant_id = p_merchant_id
  for update;

  if not found then
    raise exception 'CREDITS_RECORD_NOT_FOUND';
  end if;

  update public.credits
  set total_credits = p_total_credits,
      used_credits = 0,
      reset_at = now()
  where merchant_id = p_merchant_id;

  insert into public.credit_transactions (merchant_id, amount, type, reason, job_id)
  values (p_merchant_id, p_total_credits, 'reset', p_reason, null);
end;
$$;

create or replace function public.create_tryon_job_with_credit(
  p_merchant_id uuid,
  p_user_image_url text,
  p_product_image_url text,
  p_product_id text default null,
  p_category text default 'upper_body',
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
as $$
declare
  merchant_record public.merchants%rowtype;
  credits_record public.credits%rowtype;
  created_job_id uuid;
begin
  select *
  into merchant_record
  from public.merchants
  where id = p_merchant_id
  for update;

  if not found then
    raise exception 'MERCHANT_NOT_FOUND';
  end if;

  if merchant_record.is_active is distinct from true or merchant_record.plan_status <> 'active' then
    raise exception 'MERCHANT_PLAN_INACTIVE';
  end if;

  select *
  into credits_record
  from public.credits
  where merchant_id = p_merchant_id
  for update;

  if not found then
    raise exception 'CREDITS_RECORD_NOT_FOUND';
  end if;

  if greatest(credits_record.total_credits - credits_record.used_credits, 0) < 1 then
    raise exception 'NO_CREDITS';
  end if;

  insert into public.tryon_jobs (
    merchant_id,
    status,
    user_image_url,
    product_image_url,
    product_id,
    category,
    metadata
  )
  values (
    p_merchant_id,
    'pending',
    p_user_image_url,
    p_product_image_url,
    p_product_id,
    p_category,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into created_job_id;

  update public.credits
  set used_credits = used_credits + 1
  where merchant_id = p_merchant_id;

  insert into public.credit_transactions (merchant_id, amount, type, reason, job_id)
  values (p_merchant_id, -1, 'debit', 'Try-on job created', created_job_id);

  return created_job_id;
end;
$$;
