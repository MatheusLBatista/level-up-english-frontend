export function formatUnreadCount(count: number) {
  return count > 9 ? "9+" : String(count);
}

export function notificationsLabel(count: number) {
  if (count <= 0) {
    return "Notificações";
  }

  return `Notificações, ${count} ${count === 1 ? "não lida" : "não lidas"}`;
}
