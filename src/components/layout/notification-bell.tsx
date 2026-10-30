"use client";

import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnreadNotificationsCount } from "@/hooks/use-notifications";
import { formatUnreadCount, notificationsLabel } from "@/lib/notifications";
import { cn } from "@/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  const { data: unread = 0 } = useUnreadNotificationsCount();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={notificationsLabel(unread)}
      title="Notificações"
      className={cn(
        "text-muted-foreground hover:text-foreground relative",
        className,
      )}
    >
      <BellIcon />
      {unread > 0 && (
        <span
          aria-hidden
          data-slot="notification-count"
          className="bg-primary text-primary-foreground ring-background absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.625rem] leading-none font-semibold tabular-nums ring-2"
        >
          {formatUnreadCount(unread)}
        </span>
      )}
    </Button>
  );
}
