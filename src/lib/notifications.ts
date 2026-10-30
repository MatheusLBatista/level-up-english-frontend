import type { UserNotification } from "@/lib/types";

export function formatUnreadCount(count: number) {
  return count > 9 ? "9+" : String(count);
}

export function notificationsLabel(count: number) {
  if (count <= 0) {
    return "Notificações";
  }

  return `Notificações, ${count} ${count === 1 ? "não lida" : "não lidas"}`;
}

export function notificationHref(notification: UserNotification) {
  return notification.type === "new_mission"
    ? `/missoes/${notification.data.mission}`
    : "/dashboard#historico";
}
