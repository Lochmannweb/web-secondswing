-- Aktive login-enheder per bruger (mobil, iPad, bærbar osv.)
create table if not exists public.login_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  device_key text not null,
  label text not null default 'Ukendt enhed',
  device_type text not null default 'ukendt',
  browser text not null default 'Browser',
  os text not null default 'Ukendt',
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint login_sessions_user_device_key unique (user_id, device_key)
);

create index if not exists login_sessions_user_id_idx
  on public.login_sessions (user_id, last_active_at desc);

alter table public.login_sessions enable row level security;

drop policy if exists "login_sessions_select_own" on public.login_sessions;
create policy "login_sessions_select_own"
  on public.login_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "login_sessions_insert_own" on public.login_sessions;
create policy "login_sessions_insert_own"
  on public.login_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "login_sessions_update_own" on public.login_sessions;
create policy "login_sessions_update_own"
  on public.login_sessions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "login_sessions_delete_own" on public.login_sessions;
create policy "login_sessions_delete_own"
  on public.login_sessions
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.login_sessions to authenticated;
grant all on public.login_sessions to service_role;
