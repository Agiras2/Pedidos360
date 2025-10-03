-- Create users profile table with role-based access
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  phone text,
  address text,
  role text not null check (role in ('client', 'employee')),
  created_at timestamp with time zone default now()
);

alter table public.users enable row level security;

-- Users can view their own profile
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

-- Users can insert their own profile
create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- Employees can view all users
create policy "employees_select_all_users"
  on public.users for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'employee'
    )
  );

-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10, 2) not null,
  image text,
  category text,
  stock integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.products enable row level security;

-- Anyone can view products
create policy "products_select_all"
  on public.products for select
  to authenticated
  using (true);

-- Only employees can insert products
create policy "products_insert_employee"
  on public.products for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'employee'
    )
  );

-- Only employees can update products
create policy "products_update_employee"
  on public.products for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'employee'
    )
  );

-- Only employees can delete products
create policy "products_delete_employee"
  on public.products for delete
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'employee'
    )
  );

-- Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null check (status in ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')) default 'pending',
  total decimal(10, 2) not null,
  payment_method text not null check (payment_method in ('cash', 'card', 'transfer')),
  delivery_address text not null,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.orders enable row level security;

-- Users can view their own orders
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

-- Users can insert their own orders
create policy "orders_insert_own"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Employees can view all orders
create policy "orders_select_all_employee"
  on public.orders for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'employee'
    )
  );

-- Employees can update all orders
create policy "orders_update_employee"
  on public.orders for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'employee'
    )
  );

-- Create order_items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price decimal(10, 2) not null,
  created_at timestamp with time zone default now()
);

alter table public.order_items enable row level security;

-- Users can view items from their own orders
create policy "order_items_select_own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Users can insert items to their own orders
create policy "order_items_insert_own"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Employees can view all order items
create policy "order_items_select_all_employee"
  on public.order_items for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'employee'
    )
  );
