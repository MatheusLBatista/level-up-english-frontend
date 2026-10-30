"use client";

import {
  Gamepad2Icon,
  Loader2Icon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/use-notifications";
import { formatFullDate, formatRelativeTime } from "@/lib/date";
import type { UserNotification } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NotificationsPanel() {
  const notificationsQuery = useNotifications();
  const notifications = notificationsQuery.data;

  return (
    <div className="flex max-h-[min(32rem,calc(100dvh-5rem))] flex-col">
      <header className="border-border flex items-center gap-3 border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Notificações</h2>
      </header>

      <div className="flex-1 overflow-y-auto">
        {!notifications ? (
          notificationsQuery.isError ? (
            <PanelError
              message="Não foi possível carregar as notificações."
              onRetry={() => void notificationsQuery.refetch()}
            />
          ) : (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-12 rounded-lg" />
              ))}
            </div>
          )
        ) : notifications.length === 0 ? (
          <p className="text-muted-foreground px-4 py-10 text-center text-sm">
            Você não tem notificações.
          </p>
        ) : (
          <>
            <ol className="divide-border divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                />
              ))}
            </ol>

            {notificationsQuery.isFetchNextPageError ? (
              <PanelError
                message="Não foi possível carregar mais notificações."
                onRetry={() => void notificationsQuery.fetchNextPage()}
              />
            ) : (
              notificationsQuery.hasNextPage && (
                <div className="border-border border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    disabled={notificationsQuery.isFetchingNextPage}
                    onClick={() => void notificationsQuery.fetchNextPage()}
                  >
                    {notificationsQuery.isFetchingNextPage && (
                      <Loader2Icon className="animate-spin" />
                    )}
                    {notificationsQuery.isFetchingNextPage
                      ? "Carregando…"
                      : "Carregar mais"}
                  </Button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PanelError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="border-destructive/40 bg-destructive/10 m-3 flex flex-wrap items-center gap-3 rounded-xl border p-3">
      <p className="text-sm">{message}</p>
      <Button size="sm" variant="outline" className="ml-auto" onClick={onRetry}>
        Tentar de novo
      </Button>
    </div>
  );
}

function notificationTone(notification: UserNotification) {
  if (notification.type === "new_mission") {
    return {
      icon: Gamepad2Icon,
      className: "bg-brand-mission/15 text-brand-mission",
    };
  }

  if (notification.data.xp < 0) {
    return {
      icon: TrendingDownIcon,
      className: "bg-destructive/15 text-destructive",
    };
  }

  return {
    icon: TrendingUpIcon,
    className: "bg-brand-done/15 text-brand-done",
  };
}

function NotificationItem({
  notification,
}: {
  notification: UserNotification;
}) {
  const { icon: Icon, className } = notificationTone(notification);

  return (
    <li
      data-slot="notification-item"
      data-read={notification.read}
      className={cn(
        "flex items-start gap-3 px-4 py-3",
        !notification.read && "bg-primary/5",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full [&_svg]:size-4",
          className,
        )}
      >
        <Icon />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p
          className={cn(
            "text-sm wrap-anywhere",
            !notification.read && "font-medium",
          )}
        >
          {notification.message}
        </p>
        <time
          dateTime={notification.createdAt}
          title={formatFullDate(notification.createdAt)}
          className="text-muted-foreground text-xs"
        >
          {formatRelativeTime(notification.createdAt)}
        </time>
      </div>

      {!notification.read && (
        <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full">
          <span className="sr-only">Não lida</span>
        </span>
      )}
    </li>
  );
}
