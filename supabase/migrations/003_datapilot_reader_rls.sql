-- DataPilot demo-table read policies for the existing datapilot_reader role
--
-- MANUAL ACTION REQUIRED:
-- Review and run this migration in the Supabase SQL Editor.
-- This migration is intentionally NOT executed automatically by DataPilot.

-- Keep row-level security enabled on all demo tables.
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Grant datapilot_reader visibility of all demo rows, for SELECT only.
-- The checks make this migration safe to run again without replacing policies.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'customers'
      and policyname = 'datapilot_reader_select_customers'
  ) then
    execute 'create policy datapilot_reader_select_customers on public.customers as permissive for select to datapilot_reader using (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'datapilot_reader_select_products'
  ) then
    execute 'create policy datapilot_reader_select_products on public.products as permissive for select to datapilot_reader using (true)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'datapilot_reader_select_orders'
  ) then
    execute 'create policy datapilot_reader_select_orders on public.orders as permissive for select to datapilot_reader using (true)';
  end if;
end
$$;

-- No INSERT, UPDATE, DELETE, TRUNCATE, CREATE, ALTER, DROP, or BYPASSRLS
-- privileges are granted by this migration.
