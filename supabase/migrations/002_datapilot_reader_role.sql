-- DataPilot read-only execution role
--
-- MANUAL ACTION REQUIRED before running this file:
-- Replace __REPLACE_WITH_GENERATED_PASSWORD__ below with a strong, unique
-- password generated outside this repository. Do not commit that password.
-- This migration is intentionally NOT executed automatically by DataPilot.

do $$
declare
  role_password text := '__REPLACE_WITH_GENERATED_PASSWORD__';
begin
  if role_password = '__REPLACE_WITH_GENERATED_PASSWORD__' then
    raise exception 'Replace the datapilot_reader password placeholder before running this migration';
  end if;

  if not exists (select 1 from pg_roles where rolname = 'datapilot_reader') then
    execute format(
      'create role datapilot_reader login password %L nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls',
      role_password
    );
  else
    execute format('alter role datapilot_reader password %L', role_password);
    alter role datapilot_reader nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
  end if;
end
$$;

-- Restrict role defaults and make every session read-only by default.
alter role datapilot_reader set default_transaction_read_only = on;
alter role datapilot_reader set statement_timeout = '10s';
alter role datapilot_reader set search_path = public;

-- Allow connection to the current database, but no database-level creation or
-- administration privileges. The role itself has NOCREATEDB/NOCREATEROLE.
do $$
begin
  execute format('grant connect on database %I to datapilot_reader', current_database());
  execute format('revoke create, temporary, temp on database %I from datapilot_reader', current_database());
end
$$;

-- The role may resolve objects in public, but cannot create or alter objects.
revoke all privileges on schema public from datapilot_reader;
grant usage on schema public to datapilot_reader;
revoke create on schema public from datapilot_reader;

-- Explicitly remove every data/schema privilege before granting the one allowed
-- capability. This protects against privileges inherited from earlier setup.
revoke all privileges on table public.customers, public.products, public.orders from datapilot_reader;
revoke insert, update, delete, truncate, references, trigger on table public.customers, public.products, public.orders from datapilot_reader;
grant select on table public.customers, public.products, public.orders to datapilot_reader;

-- Do not grant access to future tables by default.
alter default privileges revoke all on tables from datapilot_reader;
alter default privileges in schema public revoke all on tables from datapilot_reader;
