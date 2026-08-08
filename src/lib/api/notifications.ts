import { apiClient } from "./client";
import type { PageResponse } from "./types";

export interface UserNotification {
  id: string;
  type: "BOOKING_FAILED" | "BOOKING_AUTO_CANCELLED" | "PAYMENT_FAILED";
  title: string;
  message: string;
  relatedBookingId: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export async function listNotifications(page = 0, size = 20) {
  const { data } = await apiClient.get<PageResponse<UserNotification>>("/api/notifications", {
    params: { page, size },
  });
  return data;
}

export async function getUnreadCount() {
  const { data } = await apiClient.get<{ count: number }>("/api/notifications/unread-count");
  return data.count;
}

export async function markNotificationRead(id: string) {
  await apiClient.patch(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await apiClient.post("/api/notifications/read-all");
}

/** Base URL for the SSE notification stream - consumed directly with EventSource, not axios. */
export function notificationsStreamUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  return `${base}/api/notifications/stream`;
}
