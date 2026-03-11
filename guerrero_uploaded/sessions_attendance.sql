-- sessions_attendance.sql
-- Base para asistencia por sesion y jugador.

create extension if not exists pgcrypto;

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  category_id uuid not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_id uuid not null,
  estado text not null check (estado in ('present','absent')),
  created_at timestamptz not null default now()
);

create unique index if not exists ux_attendance_session_player
  on public.attendance(session_id, player_id);

alter table public.sessions enable row level security;
alter table public.attendance enable row level security;

drop policy if exists "sessions_select_authenticated" on public.sessions;
create policy "sessions_select_authenticated"
  on public.sessions for select to authenticated using (true);

drop policy if exists "sessions_insert_authenticated" on public.sessions;
create policy "sessions_insert_authenticated"
  on public.sessions for insert to authenticated with check (true);

drop policy if exists "attendance_select_authenticated" on public.attendance;
create policy "attendance_select_authenticated"
  on public.attendance for select to authenticated using (true);

drop policy if exists "attendance_upsert_authenticated" on public.attendance;
create policy "attendance_upsert_authenticated"
  on public.attendance for insert to authenticated with check (true);

drop policy if exists "attendance_update_authenticated" on public.attendance;
create policy "attendance_update_authenticated"
  on public.attendance for update to authenticated using (true) with check (true);
