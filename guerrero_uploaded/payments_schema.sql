-- payments_schema.sql
-- Estructura minima para registrar pagos por jugador y mes.

create extension if not exists pgcrypto;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.inscripciones(id) on delete cascade,
  category_id uuid null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'DOP' check (currency in ('DOP','USD')),
  method text not null check (method in ('cash','transfer','card')),
  month date not null check (date_trunc('month', month)::date = month),
  paid_at date not null,
  status text not null default 'paid' check (status in ('paid','pending','refunded')),
  note text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_player_month on public.payments(player_id, month);
create index if not exists idx_payments_created_at on public.payments(created_at desc);

alter table public.payments enable row level security;

-- Ajusta estas politicas si luego separas roles (admin/staff).
drop policy if exists "payments_select_authenticated" on public.payments;
create policy "payments_select_authenticated"
  on public.payments
  for select
  to authenticated
  using (true);

drop policy if exists "payments_insert_authenticated" on public.payments;
create policy "payments_insert_authenticated"
  on public.payments
  for insert
  to authenticated
  with check (true);

drop policy if exists "payments_update_authenticated" on public.payments;
create policy "payments_update_authenticated"
  on public.payments
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "payments_delete_authenticated" on public.payments;
create policy "payments_delete_authenticated"
  on public.payments
  for delete
  to authenticated
  using (true);
