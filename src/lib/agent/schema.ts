export const demoSchema = `
customers (
  id text primary key,
  name text not null,
  industry text not null,
  country text not null,
  created_at date not null
)
products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric not null
)
orders (
  id text primary key,
  customer_id text references customers(id),
  product_id text references products(id),
  quantity integer not null,
  amount numeric not null,
  status text not null,
  created_at date not null
)
`.trim();

export const allowedTables = ["customers", "products", "orders"] as const;
