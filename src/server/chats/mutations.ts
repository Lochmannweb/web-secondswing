import { prisma } from "@/server/db/prisma";
import { serializeChat, serializeMessage } from "@/server/chats/serialize";
import { ensureProfile } from "@/server/profiles/queries";

type CreateMessageInput = {
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  content?: string;
  image_url?: string | null;
};

export async function findOrCreateChat(buyerId: string, sellerId: string) {
  const existing = await prisma.chat.findFirst({
    where: {
      OR: [
        { buyerId, sellerId },
        { buyerId: sellerId, sellerId: buyerId },
      ],
    },
  });

  if (existing) {
    return serializeChat(existing);
  }

  await Promise.all([ensureProfile(buyerId), ensureProfile(sellerId)]);

  const chat = await prisma.chat.create({
    data: {
      buyerId,
      sellerId,
    },
  });

  return serializeChat(chat);
}

export async function createMessage(input: CreateMessageInput) {
  await Promise.all([
    ensureProfile(input.sender_id),
    ensureProfile(input.receiver_id),
  ]);

  const message = await prisma.message.create({
    data: {
      chatId: input.chat_id,
      senderId: input.sender_id,
      receiverId: input.receiver_id,
      content: input.content ?? "",
      imageUrl: input.image_url ?? null,
    },
  });

  return serializeMessage(message);
}

export async function createMessages(inputs: CreateMessageInput[]) {
  const results = [];
  for (const input of inputs) {
    results.push(await createMessage(input));
  }
  return results;
}

export async function markChatRead(chatId: string, userId: string) {
  await prisma.message.updateMany({
    where: {
      chatId,
      receiverId: userId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export async function markMessageRead(messageId: string, userId: string) {
  await prisma.message.updateMany({
    where: {
      id: messageId,
      receiverId: userId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export async function markAllMessagesRead(userId: string) {
  await prisma.message.updateMany({
    where: { receiverId: userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markMessagesReadForChat(chatId: string, userId: string) {
  return markChatRead(chatId, userId);
}
