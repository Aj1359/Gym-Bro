import { useState, useEffect } from 'react';
import { getNotifications, getUnreadCount, markAsRead, type Notification } from '../features/notifications/notificationApi';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getUnreadCount().then(setUnreadCount);
    const interval = setInterval(() => getUnreadCount().then(setUnreadCount), 30000);
    return () => clearInterval(interval);
  }, []);

  function toggleOpen() {
    if (!open) getNotifications().then(setNotifications);
    setOpen((v) => !v);
  }

  async function handleRead(id: string) {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  return (
    <div className="relative">
      <button onClick={toggleOpen} className="relative rounded-full border border-[var(--color-border)] p-2">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg">
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="p-4 text-sm text-[var(--color-text-muted)]">No notifications yet.</p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && handleRead(n.id)}
                className={`cursor-pointer border-b border-[var(--color-border)] p-3 text-sm ${!n.read ? 'bg-[var(--color-accent)]/5' : ''}`}
              >
                <div className="font-semibold">{n.title}</div>
                <div className="text-[var(--color-text-muted)]">{n.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
