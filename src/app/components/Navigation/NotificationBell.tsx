"use client";

import { useNotifications } from "@/app/hooks/useNotifications";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { Popover } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NotificationList, NotificationPanelFooter } from "./NotificationList";
import type { AppNotification } from "@/app/lib/notifications";
import "./notificationBell.css";

const PREVIEW_COUNT = 3;

type NotificationBellProps = {
  isHero?: boolean;
};

export default function NotificationBell({ isHero = false }: NotificationBellProps) {
  const router = useRouter();
  const { notifications, unreadCount, loading, isLoggedIn, markRead, markAllRead } =
    useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  if (!isLoggedIn) return null;

  const previewItems = notifications.slice(0, PREVIEW_COUNT);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = async (notification: AppNotification) => {
    await markRead(notification);
    handleClose();
    router.push(notification.link);
  };

  return (
    <>
      <button
        type="button"
        className={`notification-bell${isHero ? " notification-bell--hero" : ""}${
          unreadCount > 0 ? " notification-bell--active" : ""
        }`}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} ulæste notifikationer`
            : "Notifikationer"
        }
        aria-expanded={open}
        aria-haspopup="true"
        onClick={handleOpen}
      >
        <NotificationsNoneOutlinedIcon className="notification-bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-bell-badge" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        className="notification-popover"
        disableScrollLock
        slotProps={{
          paper: { className: "notification-popover-paper" },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        marginThreshold={12}
      >
        <div className="notification-panel">
          <div className="notification-panel-header">
            <p className="notification-panel-kicker">Notifikationer</p>
            <h2 className="notification-panel-title">
              {unreadCount > 0 ? `${unreadCount} nye` : "Opdateringer"}
            </h2>
          </div>

          {loading ? (
            <p className="notification-empty">Henter...</p>
          ) : (
            <NotificationList
              notifications={previewItems}
              onSelect={handleSelect}
              compact
              emptyText="Du er helt ajour — ingen nye notifikationer"
            />
          )}

          <NotificationPanelFooter
            onClose={handleClose}
            showMarkAll
            onMarkAll={markAllRead}
            hasUnread={unreadCount > 0}
          />
        </div>
      </Popover>
    </>
  );
}
