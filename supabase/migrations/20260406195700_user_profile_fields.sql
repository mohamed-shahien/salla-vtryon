-- Migration: Add profile fields to users
-- Date: 2026-04-06

alter table public.users
add column if not exists full_name text;

-- Update existing users to have a default name from their email prefix if null
update public.users
set full_name = split_part(email, '@', 1)
where full_name is null;
