import type { NotificationPreferences, NotificationType } from "@/app/lib/notifications";
import { isInAppEnabled } from "@/app/lib/notifications";
import { getUnreadMessageCount, markAllMessagesRead, markChatRead } from "@/server/chats";
import { prisma } from "@/server/db/prisma";
import { getProfilesByIds } from "@/server/profiles";

export type NotificationDto = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  read_at: string | null;
  created_at: string;
  source: "table" | "message";
  metadata?: Record<string, unknown>;
};

function dedupeNotifications(items: NotificationDto[]): NotificationDto[] {
  const byKey = new Map<string, NotificationDto>();

  for (const item of items) {
    const chatId = item.metadata?.chat_id as string | undefined;
    const key =
      item.type === "message" && chatId ? `message:${chatId}` : `${item.source}:${item.id}`;

    const existing = byKey.get(key);
    if (!existing || new Date(item.created_at) > new Date(existing.created_at)) {
      byKey.set(key, item);
    }
  }

  return [...byKey.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

async function fetchMessageNotifications(userId: string): Promise<NotificationDto[]> {
  const messages = await prisma.message.findMany({
    where: { receiverId: userId, readAt: null },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  if (!messages.length) return [];

  const senderIds = [...new Set(messages.map((message) => message.senderId))];
  const profiles = await getProfilesByIds(senderIds);
  const nameById = new Map(
    profiles.map((profile) => [profile.id, profile.display_name ?? "En bruger"])
  );

  const seenChats = new Set<string>();
  const notifications: NotificationDto[] = [];

  for (const message of messages) {
    if (!message.chatId || seenChats.has(message.chatId)) continue;
    seenChats.add(message.chatId);

    const senderName = nameById.get(message.senderId) ?? "En bruger";
    const preview =
      message.content.trim().length > 0
        ? message.content.slice(0, 120)
        : "Sendte et billede";

    notifications.push({
      id: `message-${message.id}`,
      type: "message",
      title: `Ny besked fra ${senderName}`,
      body: preview,
      link: `/chats?chatId=${message.chatId}`,
      read_at: message.readAt?.toISOString() ?? null,
      created_at: message.createdAt.toISOString(),
      source: "message",
      metadata: { message_id: message.id, chat_id: message.chatId },
    });
  }

  return notifications;
}

export async function listNotifications(
  userId: string,
  preferences: NotificationPreferences
): Promise<NotificationDto[]> {
  const messageItems = await fetchMessageNotifications(userId);
  const merged = dedupeNotifications(messageItems);

  return merged.filter((item) => isInAppEnabled(item.type, preferences));
}

export async function markNotificationRead(
  userId: string,
  notification: Pick<NotificationDto, "id" | "source" | "metadata">
) {
  if (notification.source !== "message") return;

  const chatId = notification.metadata?.chat_id as string | undefined;
  if (!chatId) return;

  await markChatRead(chatId, userId);
}

export async function markAllNotificationsRead(
  userId: string,
  notifications: Array<Pick<NotificationDto, "id" | "source" | "read_at">>
) {
  const hasUnreadMessages = notifications.some(
    (item) => item.source === "message" && !item.read_at
  );

  if (hasUnreadMessages) {
    await markAllMessagesRead(userId);
  }
}

export async function getUnreadNotificationCount(userId: string) {
  return getUnreadMessageCount(userId);
}
