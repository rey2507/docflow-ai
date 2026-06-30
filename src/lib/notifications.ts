export type NotificationKind = 'success' | 'warning' | 'info' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  read: boolean;
  createdAt: string;
  actionPage?: 'reports' | 'upload' | 'settings' | 'notifications';
}

const STORAGE_KEY = 'docflow.notifications.v1';
const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_MS = 8 * DAY_MS;

const fallbackSeed: AppNotification[] = [
  {
    id: 'seed-1',
    title: 'Processing complete',
    message: '3 documents finished processing successfully.',
    kind: 'success',
    read: false,
    createdAt: new Date(Date.now() - 2 * DAY_MS).toISOString(),
    actionPage: 'reports',
  },
  {
    id: 'seed-2',
    title: 'Upload queue ready',
    message: 'Your upload queue is ready for the next batch.',
    kind: 'info',
    read: false,
    createdAt: new Date(Date.now() - 4 * DAY_MS).toISOString(),
    actionPage: 'upload',
  },
  {
    id: 'seed-3',
    title: 'Security notice',
    message: 'Review your workspace settings to keep access up to date.',
    kind: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 7 * DAY_MS).toISOString(),
    actionPage: 'settings',
  },
];

function isBrowser() {
  return typeof window !== 'undefined';
}

function normalize(notifications: AppNotification[]) {
  const cutoff = Date.now() - RETENTION_MS;
  return notifications
    .filter((notification) => new Date(notification.createdAt).getTime() >= cutoff)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function loadNotifications() {
  if (!isBrowser()) {
    return normalize(fallbackSeed);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = normalize(fallbackSeed);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as AppNotification[];
    const normalized = normalize(parsed);
    if (normalized.length !== parsed.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    const seeded = normalize(fallbackSeed);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function saveNotifications(notifications: AppNotification[]) {
  const normalized = normalize(notifications);
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function getUnreadCount(notifications: AppNotification[]) {
  return notifications.filter((notification) => !notification.read).length;
}

export function markNotificationRead(id: string) {
  const notifications = loadNotifications().filter((notification) => notification.id !== id);
  return saveNotifications(notifications);
}

export function markAllNotificationsRead() {
  return saveNotifications([]);
}

export function removeExpiredNotifications() {
  return saveNotifications(loadNotifications());
}
