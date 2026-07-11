"use client";

import { formatRelativeTime, type AppNotification } from "@/app/lib/notifications";
import Link from "next/link";

type NotificationListProps = {
  notifications: AppNotification[];
  onSelect: (notification: AppNotification) => void;
  emptyText?: string;
  compact?: boolean;
};

export function NotificationList({
  notifications,
  onSelect,
  emptyText = "Ingen notifikationer endnu",
  compact = false,
}: NotificationListProps) {
  if (!notifications.length) {
    return <p className="notification-empty">{emptyText}</p>;
  }

  return (
    <ul className={`notification-list${compact ? " notification-list--compact" : ""}`}>
      {notifications.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className={`notification-item${item.read_at ? "" : " notification-item--unread"}`}
            onClick={() => onSelect(item)}
          >
            <span className="notification-item-kicker">{item.type === "message" ? "Besked" : "Opdatering"}</span>
            <span className="notification-item-title">{item.title}</span>
            <span className="notification-item-body">{item.body}</span>
            <span className="notification-item-time">{formatRelativeTime(item.created_at)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

type NotificationPanelFooterProps = {
  onClose?: () => void;
  showMarkAll?: boolean;
  onMarkAll?: () => void;
  hasUnread?: boolean;
};

export function NotificationPanelFooter({
  onClose,
  showMarkAll = false,
  onMarkAll,
  hasUnread = false,
}: NotificationPanelFooterProps) {
  return (
    <div className="notification-panel-footer">
      {showMarkAll && hasUnread && onMarkAll ? (
        <button type="button" className="notification-footer-action" onClick={onMarkAll}>
          Markér alle som læst
        </button>
      ) : (
        <span />
      )}
      <Link
        href="/notifikationer"
        className="notification-footer-link"
        onClick={onClose}
      >
        Se alle
      </Link>
    </div>
  );
}
