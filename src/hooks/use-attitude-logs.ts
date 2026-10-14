"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { listAttitudeLogs } from "@/services/attitudes";

export function useMyAttitudeLogs(limit = 6) {
  const { token, user } = useAuth();
  const teacher = user?._id;

  return useQuery({
    queryKey: ["attitude-logs", "list", { teacher, limit }],
    queryFn:
      token && teacher
        ? () => listAttitudeLogs(token, { teacher, limit })
        : skipToken,
  });
}
