"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  useBoardsLoad,
  useTasksLoad,
} from "@/components/providers/app-data-provider";
import {
  buildAccountNotifications,
  loadReadNotificationIds,
  readNotificationsStorageKey,
  saveReadNotificationIds,
  type AccountNotification,
  type NotificationKind,
} from "@/modules/user/lib/account-notifications";
import { useAuth } from "@/modules/user/providers/auth-provider";
import { useAppSelector } from "@/store/hooks";

export function AppShellNotifications() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const boardsLoad = useBoardsLoad();
  const tasksLoad = useTasksLoad();
  const boardCatalog = useAppSelector((state) => state.tasks.boardCatalog);
  const storageKey = readNotificationsStorageKey(user?.id ?? null);

  const notifications = useMemo(
    () =>
      buildAccountNotifications({
        user,
        isAuthLoading,
        boardCount: boardCatalog.length,
        boardsReady: boardsLoad.isReady,
        boardsError: boardsLoad.error,
        tasksError: tasksLoad.error,
      }),
    [
      boardCatalog.length,
      boardsLoad.error,
      boardsLoad.isReady,
      isAuthLoading,
      tasksLoad.error,
      user,
    ],
  );

  return (
    <AppShellNotificationsPanel
      key={storageKey}
      storageKey={storageKey}
      notifications={notifications}
      isAuthLoading={isAuthLoading}
    />
  );
}

type AppShellNotificationsPanelProps = {
  storageKey: string;
  notifications: AccountNotification[];
  isAuthLoading: boolean;
};

function AppShellNotificationsPanel({
  storageKey,
  notifications,
  isAuthLoading,
}: AppShellNotificationsPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState(() =>
    loadReadNotificationIds(storageKey),
  );

  const unreadCount = notifications.filter(
    (notification) => !readIds.has(notification.id),
  ).length;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const markAsRead = (notificationId: string) => {
    setReadIds((current) => {
      if (current.has(notificationId)) {
        return current;
      }
      const next = new Set(current);
      next.add(notificationId);
      saveReadNotificationIds(storageKey, next);
      return next;
    });
  };

  const markAllAsRead = () => {
    const next = new Set(notifications.map((notification) => notification.id));
    setReadIds(next);
    saveReadNotificationIds(storageKey, next);
  };

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`text-muted hover:bg-surface hover:text-foreground relative flex h-10 w-10 items-center justify-center rounded-2xl transition-colors ${
          isOpen ? "bg-surface text-foreground" : ""
        }`}
        aria-label="Уведомления"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="bg-accent-strong absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Уведомления аккаунта"
          className="border-accent-soft/80 bg-surface absolute top-full right-0 z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border shadow-lg ring-1 ring-black/5"
        >
          <div className="border-accent-soft/60 flex items-center justify-between gap-3 border-b px-4 py-3">
            <h2 className="text-foreground text-sm font-semibold">
              Уведомления
            </h2>
            {notifications.length > 0 && unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-accent-strong hover:text-foreground text-xs font-medium transition-colors"
              >
                Прочитать все
              </button>
            ) : null}
          </div>

          {notifications.length === 0 ? (
            <p className="text-muted px-4 py-6 text-center text-sm">
              {isAuthLoading ? "Загрузка…" : "Новых уведомлений нет"}
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isUnread={!readIds.has(notification.id)}
                  onActivate={() => markAsRead(notification.id)}
                />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

type NotificationItemProps = {
  notification: AccountNotification;
  isUnread: boolean;
  onActivate: () => void;
};

function NotificationItem({
  notification,
  isUnread,
  onActivate,
}: NotificationItemProps) {
  return (
    <li>
      <div
        className={`hover:bg-accent-soft/40 flex gap-3 px-4 py-3 transition-colors ${
          isUnread ? "bg-accent-soft/25" : ""
        }`}
      >
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${kindStyles[notification.kind]}`}
          aria-hidden
        >
          <NotificationKindIcon kind={notification.kind} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-medium">
            {notification.title}
          </p>
          <p className="text-muted mt-0.5 text-xs leading-relaxed">
            {notification.message}
          </p>
          {notification.href ? (
            <Link
              href={notification.href}
              onClick={onActivate}
              className="text-accent-strong hover:text-foreground mt-2 inline-block text-xs font-semibold transition-colors"
            >
              {notification.hrefLabel ?? "Подробнее"}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onActivate}
              className="text-accent-strong hover:text-foreground mt-2 text-xs font-semibold transition-colors"
            >
              Отметить прочитанным
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

const kindStyles: Record<NotificationKind, string> = {
  info: "bg-accent-soft text-accent-strong",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  security: "bg-purple-50 text-purple-700",
};

function NotificationKindIcon({ kind }: { kind: NotificationKind }) {
  switch (kind) {
    case "success":
      return <CheckIcon />;
    case "warning":
      return <AlertIcon />;
    case "security":
      return <ShieldIcon />;
    default:
      return <InfoIcon />;
  }
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z" fill="currentColor" />
      <path
        d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 10v6M12 7h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 9v4M12 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10.3 4.5h3.4L21 19H3L10.3 4.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 20 7v6c0 4.5-3.2 8.7-8 10-4.8-1.3-8-5.5-8-10V7l8-4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
