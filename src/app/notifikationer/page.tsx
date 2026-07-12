"use client";

import { NotificationList, NotificationPanelFooter } from "@/app/components/Navigation/NotificationList";
import { useNotifications } from "@/app/hooks/useNotifications";
import type { AppNotification } from "@/app/lib/notifications";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import "../profile.css";
import "../profil.css";
import "./notifikationer.css";

export default function NotifikationerPage() {
  const router = useRouter();
  const { notifications, unreadCount, loading, isLoggedIn, markRead, markAllRead } =
    useNotifications();

  const handleSelect = async (notification: AppNotification) => {
    await markRead(notification);
    router.push(notification.link);
  };

  if (!isLoggedIn && !loading) {
    return (
      <Box className="profile-page">
        <Box className="notification-page-gate">
          <p className="notification-page-kicker">Notifikationer</p>
          <h1 className="notification-page-title">Log ind for at se notifikationer</h1>
          <p className="notification-page-text">
            Hold styr på beskeder, tilbud og opdateringer fra din profil.
          </p>
          <Button
            variant="contained"
            className="notification-page-login"
            onClick={() => router.push("/profile")}
          >
            Gå til profil
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="profile-page profile-page--standalone">
      <Box className="notification-page">
        <Button
          onClick={() => router.push("/profile")}
          className="profil-back"
          startIcon={<NavigateBeforeIcon />}
        >
          Tilbage
        </Button>

        <header className="notification-page-header">
          <p className="notification-page-kicker">Profil</p>
          <h1 className="notification-page-title">Notifikationer</h1>
          <p className="notification-page-subtitle">
            {unreadCount > 0
              ? `${unreadCount} ulæste opdateringer`
              : "Du er ajour med alle opdateringer"}
          </p>
        </header>

        {loading ? (
          <p className="notification-empty">Henter notifikationer...</p>
        ) : (
          <NotificationList
            notifications={notifications}
            onSelect={handleSelect}
            emptyText="Ingen notifikationer endnu. Nye beskeder og opdateringer vises her."
          />
        )}

        {notifications.length > 0 && (
          <NotificationPanelFooter
            showMarkAll
            onMarkAll={markAllRead}
            hasUnread={unreadCount > 0}
          />
        )}

        <p className="notification-page-settings-hint">
          Vil du styre hvad du modtager?{" "}
          <button
            type="button"
            className="notification-page-settings-link"
            onClick={() => router.push("/indstillinger/notifikationer")}
          >
            Gå til notifikationsindstillinger
          </button>
        </p>
      </Box>
    </Box>
  );
}
