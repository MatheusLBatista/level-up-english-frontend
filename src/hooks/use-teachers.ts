"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { listTeachers } from "@/services/users";

/** `null` traz ativos e inativos. */
export function useTeachers(active: boolean | null = true) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["users", "list", { role: "teacher", active }],
    queryFn: token ? () => listTeachers(token, active) : skipToken,
    select: (page) => page.docs,
  });
}

export function useActiveTeachers() {
  return useTeachers(true);
}
