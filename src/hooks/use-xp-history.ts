"use client";

import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { getXpHistory, type XpHistoryFilters } from "@/services/users";

export function useXpHistory(
  studentId: string | null | undefined,
  filters: XpHistoryFilters = {},
) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["users", studentId, "xp-history", filters],
    queryFn:
      token && studentId
        ? () => getXpHistory(studentId, token, filters)
        : skipToken,
    placeholderData: keepPreviousData,
  });
}
