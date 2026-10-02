"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { listActiveTeachers } from "@/services/users";

export function useActiveTeachers() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["users", "list", { role: "teacher", active: true }],
    queryFn: token ? () => listActiveTeachers(token) : skipToken,
    select: (page) => page.docs,
    staleTime: 5 * 60 * 1000,
  });
}
