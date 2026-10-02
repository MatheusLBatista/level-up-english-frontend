"use client";

import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { listClasses } from "@/services/classes";

export const classStatuses = ["ativas", "inativas", "todas"] as const;

export type ClassStatus = (typeof classStatuses)[number];

const activeByStatus: Record<ClassStatus, boolean | null> = {
  ativas: true,
  inativas: false,
  todas: null,
};

export function useAdminClasses(status: ClassStatus) {
  const { token } = useAuth();
  const active = activeByStatus[status];

  return useQuery({
    queryKey: ["classes", "list", { scope: "admin", active }],
    queryFn: token ? () => listClasses(token, { active }) : skipToken,
    select: (page) => page.docs,
    placeholderData: keepPreviousData,
  });
}
