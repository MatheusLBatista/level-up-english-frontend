"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { listAttitudes } from "@/services/attitudes";

export function useAttitudes() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["attitudes"],
    queryFn: token ? () => listAttitudes(token) : skipToken,
    select: (page) => page.docs,
    staleTime: 10 * 60 * 1000,
  });
}
