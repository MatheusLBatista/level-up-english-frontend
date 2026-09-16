"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { getClassById } from "@/services/classes";

export function useClass(classId: string | null | undefined) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["classes", classId],
    queryFn: classId && token ? () => getClassById(classId, token) : skipToken,
    staleTime: 10 * 60 * 1000,
  });
}
