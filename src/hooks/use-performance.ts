"use client";

import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { getPerformance, type PerformancePeriod } from "@/services/users";

export function usePerformance(
  studentId: string | null | undefined,
  period: PerformancePeriod = {},
) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["performance", studentId, period],
    queryFn:
      token && studentId
        ? () => getPerformance(studentId, token, period)
        : skipToken,
    placeholderData: keepPreviousData,
  });
}
