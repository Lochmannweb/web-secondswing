import type { AppNotification, NotificationPreferences } from "@/app/lib/notifications";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Request fejlede");
  }
  return payload;
}

export async function fetchNotificationsFromApi(
  userId: string,
  preferences: NotificationPreferences
): Promise<AppNotification[]> {
  const params = new URLSearchParams({
    user_id: userId,
    preferences: JSON.stringify(preferences),
  });

  const response = await fetch(`/api/notifications?${params.toString()}`, {
    cache: "no-store",
  });

  return parseJson<AppNotification[]>(response);
}

export async function markNotificationReadApi(
  userId: string,
  notification: AppNotification
): Promise<void> {
  await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      action: "read",
      notification: {
        id: notification.id,
        source: notification.source,
        metadata: notification.metadata,
      },
    }),
  });
}

export async function markAllNotificationsReadApi(
  userId: string,
  notifications: AppNotification[]
): Promise<void> {
  await fetch("/api/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      action: "read_all",
      notifications,
    }),
  });
}
