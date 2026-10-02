"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { listAttitudeLogs } from "@/services/attitudes";

export function useMyAttitudeLogs(limit = 6) {
  const { token, user } = useAuth();
  const teacher = user?._id;

  return useQuery({
    queryKey: ["attitude-logs", "list", { teacher, limit }],
    queryFn:
      token && teacher
        ? () => listAttitudeLogs(token, { teacher, limit })
        : skipToken,
  });
}

export function useStudentAttitudeLogs(studentId: string | null, limit = 8) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["attitude-logs", "list", { student: studentId, limit }],
    queryFn:
      token && studentId
        ? () => listAttitudeLogs(token, { student: studentId, limit })
        : skipToken,
  });
}
