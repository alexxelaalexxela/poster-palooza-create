-- Create user_carts table for persisting carts per logged-in user
create table if not exists public.user_carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_carts enable row level security;

-- Policies: a user can read and write their own cart
create policy if not exists "user can read own cart"
  on public.user_carts for select
  using (auth.uid() = user_id);

create policy if not exists "user can insert own cart"
  on public.user_carts for insert
  with check (auth.uid() = user_id);

create policy if not exists "user can update own cart"
  on public.user_carts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists user_carts_updated_at_idx on public.user_carts(updated_at desc);


