import { prisma } from "@/server/db/prisma";
import {
  serializeChat,
  serializeMessage,
  type ChatInboxDto,
  type ChatPreviewDto,
} from "@/server/chats/serialize";

export async function listChatsForUser(userId: string) {
  const chats = await prisma.chat.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    orderBy: { createdAt: "desc" },
  });

  return chats.map(serializeChat);
}

export async function getChatInbox(userId: string): Promise<ChatInboxDto> {
  const chats = await listChatsForUser(userId);

  if (!chats.length) {
    return { chats: [], previews: [], unread_by_chat: {} };
  }

  const chatIds = chats.map((chat) => chat.id);

  const [messages, unreadMessages] = await Promise.all([
    prisma.message.findMany({
      where: { chatId: { in: chatIds } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.message.findMany({
      where: {
        chatId: { in: chatIds },
        receiverId: userId,
        readAt: null,
      },
      select: { chatId: true },
    }),
  ]);

  const previewMap = new Map<string, ChatPreviewDto>();
  for (const message of messages) {
    if (!previewMap.has(message.chatId)) {
      previewMap.set(message.chatId, {
        chat_id: message.chatId,
        content: message.content,
        created_at: message.createdAt.toISOString(),
      });
    }
  }

  const unreadByChat: Record<string, number> = {};
  for (const row of unreadMessages) {
    unreadByChat[row.chatId] = (unreadByChat[row.chatId] ?? 0) + 1;
  }

  return {
    chats,
    previews: [...previewMap.values()],
    unread_by_chat: unreadByChat,
  };
}

export async function findChatBetweenUsers(userA: string, userB: string) {
  const chat = await prisma.chat.findFirst({
    where: {
      OR: [
        { buyerId: userA, sellerId: userB },
        { buyerId: userB, sellerId: userA },
      ],
    },
  });

  return chat ? serializeChat(chat) : null;
}

export async function getMessagesForChat(chatId: string) {
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
  });

  return messages.map(serializeMessage);
}

export async function getUnreadMessageCount(userId: string) {
  return prisma.message.count({
    where: { receiverId: userId, readAt: null },
  });
}

export async function findChatById(chatId: string) {
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  return chat ? serializeChat(chat) : null;
}
