"use client";

import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import {
  getMission,
  listMissions,
  type MissionFilters,
} from "@/services/missions";

export function useMissions(filters: MissionFilters = {}, enabled = true) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["missions", filters],
    queryFn: token && enabled ? () => listMissions(token, filters) : skipToken,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useMissionById(id: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["missions", "detail", id],
    queryFn: token ? () => getMission(id, token) : skipToken,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
