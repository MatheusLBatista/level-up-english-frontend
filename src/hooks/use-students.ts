"use client";

import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { listStudents, type StudentFilters } from "@/services/users";

export function useStudents(filters: StudentFilters) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["users", "list", { role: "student", ...filters }],
    queryFn: token ? () => listStudents(token, filters) : skipToken,
    placeholderData: keepPreviousData,
  });
}
