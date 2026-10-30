"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { getUnreadNotificationsCount } from "@/services/notifications";

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
