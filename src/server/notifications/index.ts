import { prisma } from "@/server/db/prisma";
import { getProfilesByIds } from "@/server/profiles";
import { getUnreadMessageCount, markAllMessagesRead, markChatRead } from "@/server/chats";
import type { NotificationPreferences, NotificationType } from "@/app/lib/notifications";
import { isInAppEnabled } from "@/app/lib/notifications";

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

type TableNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
  metadata: unknown;
};

function serializeTableNotification(row: TableNotification): NotificationDto {
  return {
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    link: row.link ?? "/notifikationer",
    read_at: row.readAt?.toISOString() ?? null,
    created_at: row.createdAt.toISOString(),
    source: "table",
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : undefined,
  };
}

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
    if (seenChats.has(message.chatId)) continue;
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
  const [tableRows, messageItems] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    fetchMessageNotifications(userId),
  ]);

  const tableItems = tableRows.map(serializeTableNotification);
  const merged = dedupeNotifications([...tableItems, ...messageItems]);

  return merged.filter((item) => isInAppEnabled(item.type, preferences));
}

export async function markNotificationRead(
  userId: string,
  notification: Pick<NotificationDto, "id" | "source" | "metadata">
) {
  if (notification.source === "table") {
    await prisma.notification.updateMany({
      where: { id: notification.id, userId },
      data: { readAt: new Date() },
    });
    return;
  }

  const chatId = notification.metadata?.chat_id as string | undefined;
  if (!chatId) return;

  await markChatRead(chatId, userId);
}

export async function markAllNotificationsRead(
  userId: string,
  notifications: Array<Pick<NotificationDto, "id" | "source" | "read_at">>
) {
  const tableIds = notifications
    .filter((item) => item.source === "table" && !item.read_at)
    .map((item) => item.id);

  if (tableIds.length) {
    await prisma.notification.updateMany({
      where: { id: { in: tableIds }, userId },
      data: { readAt: new Date() },
    });
  }

  await markAllMessagesRead(userId);
}

export async function getUnreadNotificationCount(userId: string) {
  const [tableCount, messageCount] = await Promise.all([
    prisma.notification.count({ where: { userId, readAt: null } }),
    getUnreadMessageCount(userId),
  ]);

  return tableCount + messageCount;
}
