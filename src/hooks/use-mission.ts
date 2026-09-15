"use client";

import { keepPreviousData ,skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { listMissions, type MissionFilters } from "@/services/missions";

export function useMissions(filters: MissionFilters = {}) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["missions", { active: true, ...filters }],
    queryFn: token ? () => listMissions(token, filters) : skipToken,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
