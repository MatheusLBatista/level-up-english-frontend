import { apiFetch } from "@/lib/api";
import type { Paginated, UserNotification } from "@/lib/types";

export const NOTIFICATIONS_PAGE_SIZE = 10;

export function getUnreadNotificationsCount(token: string) {
  return apiFetch<{ unread: number }>("/notifications/unread-count", {
    token,
  });
}

export function listNotifications(token: string, page = 1) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(NOTIFICATIONS_PAGE_SIZE),
  });

  return apiFetch<Paginated<UserNotification>>(`/notifications?${params}`, {
    token,
  });
}

export function markNotificationRead(id: string, token: string) {
  return apiFetch<UserNotification>(`/notifications/${id}/read`, {
    method: "PATCH",
    token,
  });
}

export function markAllNotificationsRead(token: string) {
  return apiFetch<{ updated: number }>("/notifications/read-all", {
    method: "PATCH",
    token,
  });
}
