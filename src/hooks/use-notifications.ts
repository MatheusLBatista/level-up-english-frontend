"use client";

import {
  skipToken,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import type { Paginated, UserNotification } from "@/lib/types";
import {
  getUnreadNotificationsCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications";

export const UNREAD_POLL_INTERVAL = 60 * 1000;

type NotificationPages = InfiniteData<Paginated<UserNotification>, number>;

function useNotificationKeys() {
  const { user } = useAuth();

  return {
    all: ["notifications"],
    count: ["notifications", "unread-count", user?._id],
    list: ["notifications", "list", user?._id],
  };
}

function markPagesRead(
  data: NotificationPages | undefined,
  isTarget: (notification: UserNotification) => boolean,
) {
  return (
    data && {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        docs: page.docs.map((notification) =>
          isTarget(notification)
            ? { ...notification, read: true }
            : notification,
        ),
      })),
    }
  );
}

function requireToken(token: string | null) {
  if (!token) {
    throw new Error("Sua sessão expirou. Entre de novo para continuar.");
  }

  return token;
}

export function useUnreadNotificationsCount() {
  const { user, token } = useAuth();
  const keys = useNotificationKeys();
  const isStudent = user?.role === "student";

  return useQuery({
    queryKey: keys.count,
    queryFn:
      token && isStudent ? () => getUnreadNotificationsCount(token) : skipToken,
    select: (data) => data.unread,
    refetchInterval: UNREAD_POLL_INTERVAL,
    refetchOnWindowFocus: "always",
  });
}

export function useNotifications() {
  const { token } = useAuth();
  const keys = useNotificationKeys();

  return useInfiniteQuery({
    queryKey: keys.list,
    queryFn: token
      ? ({ pageParam }) => listNotifications(token, pageParam)
      : skipToken,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNextPage ? last.nextPage : undefined),
    select: (data) => data.pages.flatMap((page) => page.docs),
    gcTime: 0,
  });
}

export function useMarkNotificationRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const keys = useNotificationKeys();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id, requireToken(token)),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: keys.all });

      const previousList = queryClient.getQueryData<NotificationPages>(
        keys.list,
      );
      const previousCount = queryClient.getQueryData<{ unread: number }>(
        keys.count,
      );

      queryClient.setQueryData<NotificationPages>(keys.list, (data) =>
        markPagesRead(data, (notification) => notification._id === id),
      );
      queryClient.setQueryData<{ unread: number }>(
        keys.count,
        (data) => data && { unread: Math.max(data.unread - 1, 0) },
      );

      return { previousList, previousCount };
    },

    onError: (_error, _id, context) => {
      queryClient.setQueryData(keys.list, context?.previousList);
      queryClient.setQueryData(keys.count, context?.previousCount);
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.count }),
  });
}

export function useMarkAllNotificationsRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const keys = useNotificationKeys();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(requireToken(token)),

    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: keys.all });

      queryClient.setQueryData<NotificationPages>(keys.list, (data) =>
        markPagesRead(data, () => true),
      );
      queryClient.setQueryData(keys.count, { unread: 0 });
    },
  });
}
