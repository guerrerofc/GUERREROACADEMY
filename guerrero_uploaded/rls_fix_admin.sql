-- rls_fix_admin.sql
-- Permisos minimos para que el panel admin funcione con usuarios autenticados.
-- Ejecuta en Supabase SQL Editor.

-- 1) Inscripciones (si existe)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='inscripciones'
  ) then
    execute 'alter table public.inscripciones enable row level security';

    execute 'drop policy if exists "inscripciones_select_authenticated" on public.inscripciones';
    execute 'create policy "inscripciones_select_authenticated" on public.inscripciones for select to authenticated using (true)';

    execute 'drop policy if exists "inscripciones_insert_authenticated" on public.inscripciones';
    execute 'create policy "inscripciones_insert_authenticated" on public.inscripciones for insert to authenticated with check (true)';

    execute 'drop policy if exists "inscripciones_update_authenticated" on public.inscripciones';
    execute 'create policy "inscripciones_update_authenticated" on public.inscripciones for update to authenticated using (true) with check (true)';
  end if;
end $$;

-- 2) Memberships (si existe)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='memberships'
  ) then
    execute 'alter table public.memberships enable row level security';

    execute 'drop policy if exists "memberships_select_authenticated" on public.memberships';
    execute 'create policy "memberships_select_authenticated" on public.memberships for select to authenticated using (true)';

    execute 'drop policy if exists "memberships_insert_authenticated" on public.memberships';
    execute 'create policy "memberships_insert_authenticated" on public.memberships for insert to authenticated with check (true)';

    execute 'drop policy if exists "memberships_update_authenticated" on public.memberships';
    execute 'create policy "memberships_update_authenticated" on public.memberships for update to authenticated using (true) with check (true)';
  end if;
end $$;

-- 3) Cupos (si existe)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='cupos'
  ) then
    execute 'alter table public.cupos enable row level security';

    execute 'drop policy if exists "cupos_select_authenticated" on public.cupos';
    execute 'create policy "cupos_select_authenticated" on public.cupos for select to authenticated using (true)';

    execute 'drop policy if exists "cupos_upsert_authenticated" on public.cupos';
    execute 'create policy "cupos_upsert_authenticated" on public.cupos for insert to authenticated with check (true)';

    execute 'drop policy if exists "cupos_update_authenticated" on public.cupos';
    execute 'create policy "cupos_update_authenticated" on public.cupos for update to authenticated using (true) with check (true)';
  end if;
end $$;

-- 4) Payments (si existe)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='payments'
  ) then
    execute 'alter table public.payments enable row level security';

    execute 'drop policy if exists "payments_select_authenticated" on public.payments';
    execute 'create policy "payments_select_authenticated" on public.payments for select to authenticated using (true)';

    execute 'drop policy if exists "payments_insert_authenticated" on public.payments';
    execute 'create policy "payments_insert_authenticated" on public.payments for insert to authenticated with check (true)';

    execute 'drop policy if exists "payments_update_authenticated" on public.payments';
    execute 'create policy "payments_update_authenticated" on public.payments for update to authenticated using (true) with check (true)';
  end if;
end $$;
