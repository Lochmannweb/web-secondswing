-- Add read state for messages
alter table if exists public.messages
  add column if not exists read_at timestamptz;

create index if not exists messages_receiver_unread_idx
  on public.messages (receiver_id, read_at);

create index if not exists messages_chat_created_idx
  on public.messages (chat_id, created_at);

-- Ensure RLS is enabled
alter table if exists public.chats enable row level security;
alter table if exists public.messages enable row level security;

-- Remove legacy broad policies if they exist
drop policy if exists "insert messages" on public.messages;
drop policy if exists "read messages" on public.messages;

-- Recreate strict policies for chats
drop policy if exists "chats_select_participants" on public.chats;
create policy "chats_select_participants"
  on public.chats
  for select
  to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "chats_insert_participants" on public.chats;
create policy "chats_insert_participants"
  on public.chats
  for insert
  to authenticated
  with check (
    auth.uid() = buyer_id
    or auth.uid() = seller_id
  );

-- Recreate strict policies for messages
drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants"
  on public.messages
  for select
  to authenticated
  using (
    auth.uid() = sender_id
    or auth.uid() = receiver_id
  );

drop policy if exists "messages_insert_sender_member" on public.messages;
create policy "messages_insert_sender_member"
  on public.messages
  for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1
      from public.chats c
      where c.id = messages.chat_id
        and (
          (c.buyer_id = sender_id and c.seller_id = receiver_id)
          or
          (c.seller_id = sender_id and c.buyer_id = receiver_id)
        )
    )
  );

drop policy if exists "messages_update_receiver_read" on public.messages;
create policy "messages_update_receiver_read"
  on public.messages
  for update
  to authenticated
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);
