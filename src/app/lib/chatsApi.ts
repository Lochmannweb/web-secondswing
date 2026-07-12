import type { ChatDto, ChatInboxDto, MessageDto } from "@/server/chats";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Request fejlede");
  }
  return payload;
}

export async function getChatInbox(userId: string): Promise<ChatInboxDto> {
  const response = await fetch(`/api/chats?user_id=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  return parseJson<ChatInboxDto>(response);
}

export async function findOrCreateChat(buyerId: string, sellerId: string): Promise<ChatDto> {
  const response = await fetch("/api/chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ buyer_id: buyerId, seller_id: sellerId }),
  });
  return parseJson<ChatDto>(response);
}

export async function getMessages(chatId: string): Promise<MessageDto[]> {
  const response = await fetch(`/api/chats/${chatId}/messages`, { cache: "no-store" });
  return parseJson<MessageDto[]>(response);
}

export async function sendMessage(input: {
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  imageUrl?: string | null;
}): Promise<MessageDto> {
  const response = await fetch(`/api/chats/${input.chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sender_id: input.senderId,
      receiver_id: input.receiverId,
      content: input.content,
      image_url: input.imageUrl ?? null,
    }),
  });
  return parseJson<MessageDto>(response);
}

export async function sendMessages(
  chatId: string,
  messages: Array<{
    sender_id: string;
    receiver_id: string;
    content?: string;
    image_url?: string | null;
  }>
): Promise<MessageDto[]> {
  const response = await fetch(`/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  return parseJson<MessageDto[]>(response);
}

export async function markChatRead(chatId: string, userId: string) {
  const response = await fetch(`/api/chats/${chatId}/messages`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  return parseJson(response);
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const response = await fetch(`/api/messages/unread?user_id=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  const payload = await parseJson<{ count: number }>(response);
  return payload.count;
}

export async function getProductsByUser(userId: string) {
  const response = await fetch(`/api/products?user_id=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  return parseJson<
    Array<{
      id: string;
      title: string;
      price: number | null;
      image_url: string | null;
      sold: boolean | null;
    }>
  >(response);
}
