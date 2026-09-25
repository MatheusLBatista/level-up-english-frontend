"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { listStudentsByClass } from "@/services/users";

export function useClassStudents(classId: string | null) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["users", "students", classId],
    queryFn:
      classId && token ? () => listStudentsByClass(classId, token) : skipToken,
    select: (page) => page.docs.filter((student) => student.class === classId),
  });
}
