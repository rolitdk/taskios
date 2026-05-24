import type { PublicUser } from "@/modules/user/model/auth-types";

export type NotificationKind = "info" | "success" | "warning" | "security";

export type AccountNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  href?: string;
  hrefLabel?: string;
};

type BuildAccountNotificationsParams = {
  user: PublicUser | null;
  isAuthLoading: boolean;
  boardCount: number;
  boardsReady: boolean;
  boardsError: string | null;
  tasksError: string | null;
};

export function buildAccountNotifications({
  user,
  isAuthLoading,
  boardCount,
  boardsReady,
  boardsError,
  tasksError,
}: BuildAccountNotificationsParams): AccountNotification[] {
  if (isAuthLoading) {
    return [];
  }

  const notifications: AccountNotification[] = [];

  if (!user) {
    notifications.push(
      {
        id: "guest-login",
        kind: "info",
        title: "Войдите в аккаунт",
        message:
          "Авторизуйтесь, чтобы сохранять доски и задачи между сессиями.",
        href: "/login",
        hrefLabel: "Войти",
      },
      {
        id: "guest-register",
        kind: "security",
        title: "Создайте аккаунт",
        message:
          "Регистрация займёт минуту и откроет доступ ко всем возможностям.",
        href: "/register",
        hrefLabel: "Регистрация",
      },
    );
    return notifications;
  }

  notifications.push({
    id: `welcome-${user.id}`,
    kind: "success",
    title: `Здравствуйте, ${user.name.split(" ")[0] ?? user.name}!`,
    message:
      "Вы вошли в аккаунт Taskios. Все изменения сохраняются автоматически.",
  });

  if (boardsError) {
    notifications.push({
      id: "boards-load-error",
      kind: "warning",
      title: "Не удалось загрузить доски",
      message: boardsError,
      href: "/boards",
      hrefLabel: "Повторить",
    });
  }

  if (tasksError) {
    notifications.push({
      id: "tasks-load-error",
      kind: "warning",
      title: "Не удалось загрузить задачи",
      message: tasksError,
    });
  }

  if (boardsReady && boardCount === 0 && !boardsError) {
    notifications.push({
      id: "empty-boards",
      kind: "info",
      title: "Создайте первую доску",
      message:
        "Добавьте доску, чтобы начать планировать задачи в формате канбан.",
      href: "/boards",
      hrefLabel: "Перейти к доскам",
    });
  }

  if (boardsReady && boardCount > 0) {
    const boardLabel =
      boardCount === 1
        ? "1 доска"
        : boardCount < 5
          ? `${boardCount} доски`
          : `${boardCount} досок`;

    notifications.push({
      id: "boards-summary",
      kind: "info",
      title: "Ваши доски",
      message: `В аккаунте доступно ${boardLabel}. Откройте список, чтобы продолжить работу.`,
      href: "/boards",
      hrefLabel: "Мои доски",
    });
  }

  notifications.push({
    id: "account-security",
    kind: "security",
    title: "Безопасность аккаунта",
    message: `Не передавайте пароль от ${user.email} третьим лицам и выходите из аккаунта на чужих устройствах.`,
  });

  return notifications;
}

export function readNotificationsStorageKey(userId: string | null): string {
  return `taskios:read-notifications:${userId ?? "guest"}`;
}

export function dismissedNotificationsStorageKey(
  userId: string | null,
): string {
  return `taskios:dismissed-notifications:${userId ?? "guest"}`;
}

export function loadReadNotificationIds(key: string): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function saveReadNotificationIds(key: string, ids: Set<string>): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify([...ids]));
}

export function loadDismissedNotificationIds(key: string): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function saveDismissedNotificationIds(
  key: string,
  ids: Set<string>,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify([...ids]));
}
