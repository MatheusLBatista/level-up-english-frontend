"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { listMissions } from "@/services/missions";

export function useMissions() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["missions", { active: true }],
    queryFn: token ? () => listMissions(token) : skipToken,
    staleTime: 5 * 60 * 1000,
  });
}
