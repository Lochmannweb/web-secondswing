-- Allow authenticated users to read basic profile fields used in chat lists.
alter table if exists public.profiles enable row level security;

drop policy if exists "profiles_chat_lookup_authenticated" on public.profiles;
create policy "profiles_chat_lookup_authenticated"
  on public.profiles
  for select
  to authenticated
  using (true);
