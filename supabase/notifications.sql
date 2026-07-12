-- Optional: run in Supabase SQL editor to enable a dedicated notifications table.
-- The app works without this (unread messages are shown as notifications).

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('message', 'offer', 'product', 'system', 'marketing')),
  title text not null,
  body text not null,
  link text,
  read_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Users read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Example trigger: create in-app notification when a message is received.
-- Skip if you prefer the app's built-in message fallback only.
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, link, metadata)
  values (
    new.receiver_id,
    'message',
    'Ny besked',
    left(coalesce(nullif(trim(new.content), ''), 'Sendte et billede'), 120),
    '/chats?chat=' || new.chat_id::text,
    jsonb_build_object('message_id', new.id, 'chat_id', new.chat_id)
  );
  return new;
end;
$$;

drop trigger if exists on_message_notify on public.messages;
create trigger on_message_notify
  after insert on public.messages
  for each row
  execute function public.notify_new_message();
