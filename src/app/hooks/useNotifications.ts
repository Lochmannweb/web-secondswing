"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  fetchNotifications,
  loadNotificationPreferences,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
  type NotificationPreferences,
} from "@/app/lib/notifications";

type UseNotificationsResult = {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  isLoggedIn: boolean;
  preferences: NotificationPreferences;
  refresh: () => Promise<void>;
  markRead: (notification: AppNotification) => Promise<void>;
  markAllRead: () => Promise<void>;
};

export function useNotifications(): UseNotificationsResult {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const isMountedRef = useRef(false);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const currentUserId = data.user?.id ?? null;

    if (!isMountedRef.current) return;

    setUserId(currentUserId);

    if (!currentUserId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const prefs = await loadNotificationPreferences(supabase);
    if (!isMountedRef.current) return;

    setPreferences(prefs);

    const items = await fetchNotifications(supabase, currentUserId, prefs);
    if (!isMountedRef.current) return;

    setNotifications(items);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    isMountedRef.current = true;
    let messageChannel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      await refresh();

      const { data } = await supabase.auth.getUser();
      const currentUserId = data.user?.id;
      if (!currentUserId || !isMountedRef.current) return;

      messageChannel = supabase
        .channel(`notifications-messages-${currentUserId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `receiver_id=eq.${currentUserId}`,
          },
          () => {
            refresh();
          }
        )
        .subscribe();
    };

    setup();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => {
      isMountedRef.current = false;
      authListener.subscription.unsubscribe();
      if (messageChannel) supabase.removeChannel(messageChannel);
    };
  }, [supabase, refresh]);

  const markRead = useCallback(
    async (notification: AppNotification) => {
      if (!userId) return;

      await markNotificationRead(supabase, notification, userId);
      if (!isMountedRef.current) return;

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, read_at: item.read_at ?? new Date().toISOString() }
            : item
        )
      );
    },
    [supabase, userId]
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;

    const unread = notifications.filter((n) => !n.read_at);
    if (!unread.length) return;

    await markAllNotificationsRead(supabase, unread, userId);
    if (!isMountedRef.current) return;

    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read_at: item.read_at ?? now }))
    );
  }, [notifications, supabase, userId]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return {
    notifications,
    unreadCount,
    loading,
    isLoggedIn: !!userId,
    preferences: preferences ?? DEFAULT_NOTIFICATION_PREFERENCES,
    refresh,
    markRead,
    markAllRead,
  };
}
