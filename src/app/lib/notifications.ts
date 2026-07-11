import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationType = "message" | "offer" | "product" | "system" | "marketing";

export type NotificationChannelPrefs = {
  in_app: boolean;
  email: boolean;
};

export type NotificationPreferences = {
  messages: NotificationChannelPrefs;
  offers: NotificationChannelPrefs;
  products: NotificationChannelPrefs;
  marketing: NotificationChannelPrefs;
};

export type AppNotification = {
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

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  messages: { in_app: true, email: true },
  offers: { in_app: true, email: true },
  products: { in_app: true, email: false },
  marketing: { in_app: false, email: false },
};

const TYPE_TO_PREF_KEY: Record<NotificationType, keyof NotificationPreferences> = {
  message: "messages",
  offer: "offers",
  product: "products",
  system: "messages",
  marketing: "marketing",
};

export function parseNotificationPreferences(raw: unknown): NotificationPreferences {
  if (!raw || typeof raw !== "object") return DEFAULT_NOTIFICATION_PREFERENCES;

  const input = raw as Partial<NotificationPreferences>;
  const merge = (key: keyof NotificationPreferences) => ({
    in_app: input[key]?.in_app ?? DEFAULT_NOTIFICATION_PREFERENCES[key].in_app,
    email: input[key]?.email ?? DEFAULT_NOTIFICATION_PREFERENCES[key].email,
  });

  return {
    messages: merge("messages"),
    offers: merge("offers"),
    products: merge("products"),
    marketing: merge("marketing"),
  };
}

export function isInAppEnabled(
  type: NotificationType,
  preferences: NotificationPreferences
): boolean {
  const key = TYPE_TO_PREF_KEY[type];
  return preferences[key].in_app;
}

export function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Nu";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} t`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  return new Date(dateString).toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "short",
  });
}

type TableNotificationRow = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
  metadata?: Record<string, unknown> | null;
};

type MessageRow = {
  id: string;
  chat_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender_id: string;
};

async function fetchTableNotifications(
  supabase: SupabaseClient,
  userId: string
): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at, metadata")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (
      error.code === "42P01" ||
      error.message.includes("does not exist") ||
      error.message.includes("Could not find the table")
    ) {
      return [];
    }
    console.error("Kunne ikke hente notifikationer:", error.message);
    return [];
  }

  return (data as TableNotificationRow[]).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link ?? "/notifikationer",
    read_at: row.read_at,
    created_at: row.created_at,
    source: "table" as const,
    metadata: row.metadata ?? undefined,
  }));
}

async function fetchMessageNotifications(
  supabase: SupabaseClient,
  userId: string
): Promise<AppNotification[]> {
  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, chat_id, content, created_at, read_at, sender_id")
    .eq("receiver_id", userId)
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error || !messages?.length) return [];

  const senderIds = [...new Set((messages as MessageRow[]).map((m) => m.sender_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", senderIds);

  const nameById = new Map(
    (profiles ?? []).map((p: { id: string; display_name: string | null }) => [
      p.id,
      p.display_name ?? "En bruger",
    ])
  );

  const seenChats = new Set<string>();
  const notifications: AppNotification[] = [];

  for (const message of messages as MessageRow[]) {
    if (seenChats.has(message.chat_id)) continue;
    seenChats.add(message.chat_id);

    const senderName = nameById.get(message.sender_id) ?? "En bruger";
    const preview =
      message.content.trim().length > 0
        ? message.content.slice(0, 120)
        : "Sendte et billede";

    notifications.push({
      id: `message-${message.id}`,
      type: "message",
      title: `Ny besked fra ${senderName}`,
      body: preview,
      link: `/chats?chat=${message.chat_id}`,
      read_at: message.read_at,
      created_at: message.created_at,
      source: "message",
      metadata: { message_id: message.id, chat_id: message.chat_id },
    });
  }

  return notifications;
}

function dedupeNotifications(items: AppNotification[]): AppNotification[] {
  const byKey = new Map<string, AppNotification>();

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

export async function fetchNotifications(
  supabase: SupabaseClient,
  userId: string,
  preferences: NotificationPreferences
): Promise<AppNotification[]> {
  const [tableItems, messageItems] = await Promise.all([
    fetchTableNotifications(supabase, userId),
    fetchMessageNotifications(supabase, userId),
  ]);

  const merged = dedupeNotifications([...tableItems, ...messageItems]);

  return merged.filter((item) => isInAppEnabled(item.type, preferences));
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  notification: AppNotification,
  userId: string
): Promise<void> {
  if (notification.source === "table") {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notification.id)
      .eq("user_id", userId);
    return;
  }

  const chatId = notification.metadata?.chat_id as string | undefined;
  if (!chatId) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("chat_id", chatId)
    .eq("receiver_id", userId)
    .is("read_at", null);
}

export async function markAllNotificationsRead(
  supabase: SupabaseClient,
  notifications: AppNotification[],
  userId: string
): Promise<void> {
  const tableIds = notifications
    .filter((n) => n.source === "table" && !n.read_at)
    .map((n) => n.id);

  if (tableIds.length) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", tableIds)
      .eq("user_id", userId);
  }

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("receiver_id", userId)
    .is("read_at", null);
}

export async function loadNotificationPreferences(
  supabase: SupabaseClient
): Promise<NotificationPreferences> {
  const { data } = await supabase.auth.getUser();
  return parseNotificationPreferences(data.user?.user_metadata?.notification_preferences);
}

export async function saveNotificationPreferences(
  supabase: SupabaseClient,
  preferences: NotificationPreferences
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({
    data: { notification_preferences: preferences },
  });

  return { error: error?.message ?? null };
}
