import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/auth-context";
import {
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  notificationsStreamUrl,
  type UserNotification,
} from "@/lib/api/notifications";

/**
 * Subscribes to GET /api/notifications/stream (Server-Sent Events) for live push, seeded with an
 * initial REST fetch of the unread count - the SSE stream only pushes *new* notifications from the
 * moment it connects, it never replays history.
 */
export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getUnreadCount().then(setUnreadCount).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // withCredentials is required here (unlike the public booking-tracking stream): this channel
    // is authenticated via the HttpOnly gt_auth cookie, and EventSource does not send cookies
    // cross-origin by default.
    const source = new EventSource(notificationsStreamUrl(), { withCredentials: true });

    source.addEventListener("notification", (event: MessageEvent<string>) => {
      try {
        const notification = JSON.parse(event.data) as UserNotification;
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } catch {
        // ignore malformed frames
      }
    });

    return () => {
      source.close();
      // Reset on logout/unmount (cleanup, not a synchronous render-phase update) so a stale
      // badge/list doesn't linger across an account switch.
      setUnreadCount(0);
      setNotifications([]);
    };
  }, [isAuthenticated]);

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return { unreadCount, notifications, markRead, markAllRead };
}
