import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchNotificationsFromApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from "@/app/lib/notificationsApi";

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

export async function fetchNotifications(
  userId: string,
  preferences: NotificationPreferences
): Promise<AppNotification[]> {
  return fetchNotificationsFromApi(userId, preferences);
}

export async function markNotificationRead(
  notification: AppNotification,
  userId: string
): Promise<void> {
  await markNotificationReadApi(userId, notification);
}

export async function markAllNotificationsRead(
  notifications: AppNotification[],
  userId: string
): Promise<void> {
  await markAllNotificationsReadApi(userId, notifications);
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
