"use client";

import { skipToken, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import {
  getUnreadNotificationsCount,
  listNotifications,
} from "@/services/notifications";

export const UNREAD_POLL_INTERVAL = 60 * 1000;

export function useUnreadNotificationsCount() {
  const { user, token } = useAuth();
  const isStudent = user?.role === "student";

  return useQuery({
    queryKey: ["notifications", "unread-count", user?._id],
    queryFn:
      token && isStudent ? () => getUnreadNotificationsCount(token) : skipToken,
    select: (data) => data.unread,
    refetchInterval: UNREAD_POLL_INTERVAL,
    refetchOnWindowFocus: "always",
  });
}

export function useNotifications() {
  const { user, token } = useAuth();

  return useInfiniteQuery({
    queryKey: ["notifications", "list", user?._id],
    queryFn: token
      ? ({ pageParam }) => listNotifications(token, pageParam)
      : skipToken,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNextPage ? last.nextPage : undefined),
    select: (data) => data.pages.flatMap((page) => page.docs),
    gcTime: 0,
  });
}
