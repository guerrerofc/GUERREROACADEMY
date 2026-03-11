-- rls_dashboard_select.sql
-- Habilita lectura (SELECT) para usuarios autenticados en tablas del dashboard.
-- Seguro para ejecutar aunque algunas tablas no existan.

-- payments (opcional)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'payments'
  ) then
    execute 'alter table public.payments enable row level security';
    execute 'drop policy if exists "payments_select_authenticated" on public.payments';
    execute 'create policy "payments_select_authenticated" on public.payments for select to authenticated using (true)';
  end if;
end $$;

-- memberships (opcional)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'memberships'
  ) then
    execute 'alter table public.memberships enable row level security';
    execute 'drop policy if exists "memberships_select_authenticated" on public.memberships';
    execute 'create policy "memberships_select_authenticated" on public.memberships for select to authenticated using (true)';
  end if;
end $$;

-- cupos (opcional)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'cupos'
  ) then
    execute 'alter table public.cupos enable row level security';
    execute 'drop policy if exists "cupos_select_authenticated" on public.cupos';
    execute 'create policy "cupos_select_authenticated" on public.cupos for select to authenticated using (true)';
  end if;
end $$;

-- players (opcional)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'players'
  ) then
    execute 'alter table public.players enable row level security';
    execute 'drop policy if exists "players_select_authenticated" on public.players';
    execute 'create policy "players_select_authenticated" on public.players for select to authenticated using (true)';
  end if;
end $$;

-- sessions (opcional)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'sessions'
  ) then
    execute 'alter table public.sessions enable row level security';
    execute 'drop policy if exists "sessions_select_authenticated" on public.sessions';
    execute 'create policy "sessions_select_authenticated" on public.sessions for select to authenticated using (true)';
  end if;
end $$;

-- attendance (opcional)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'attendance'
  ) then
    execute 'alter table public.attendance enable row level security';
    execute 'drop policy if exists "attendance_select_authenticated" on public.attendance';
    execute 'create policy "attendance_select_authenticated" on public.attendance for select to authenticated using (true)';
  end if;
end $$;
