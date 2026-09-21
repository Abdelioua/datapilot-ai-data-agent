create table if not exists public.customers (
  id text primary key,
  name text not null,
  industry text not null,
  country text not null,
  created_at date not null
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(12, 2) not null check (price >= 0)
);

create table if not exists public.orders (
  id text primary key,
  customer_id text not null references public.customers(id),
  product_id text not null references public.products(id),
  quantity integer not null check (quantity > 0),
  amount numeric(12, 2) not null check (amount >= 0),
  status text not null check (status in ('completed', 'processing', 'refunded')),
  created_at date not null
);

create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_product_id_idx on public.orders(product_id);
create index if not exists orders_created_at_idx on public.orders(created_at);
create index if not exists orders_status_idx on public.orders(status);

alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- The application uses a server-only database connection in a read-only transaction.
-- Do not expose SUPABASE_SECRET_KEY or DATAPILOT_READONLY_DB_URL to the browser.
