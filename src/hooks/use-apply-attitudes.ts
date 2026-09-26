"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import type { Attitude, User } from "@/lib/types";
import { applyAttitude } from "@/services/attitudes";

export type ApplyAttitudesInput = {
  students: User[];
  attitudes: Attitude[];
};

export type ApplyAttitudesFailure = {
  student: User;
  attitude: Attitude;
  message: string;
};

export type ApplyAttitudesSummary = {
  total: number;
  applied: number;
  failures: ApplyAttitudesFailure[];
};

export function useApplyAttitudes() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      students,
      attitudes,
    }: ApplyAttitudesInput): Promise<ApplyAttitudesSummary> => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      const failuresPerStudent = await Promise.all(
        students.map(async (student) => {
          const failures: ApplyAttitudesFailure[] = [];

          for (const attitude of attitudes) {
            try {
              await applyAttitude(
                { student: student._id, attitude: attitude._id },
                token,
              );
            } catch (error) {
              failures.push({
                student,
                attitude,
                message:
                  error instanceof Error ? error.message : "Erro desconhecido.",
              });
            }
          }

          return failures;
        }),
      );

      const failures = failuresPerStudent.flat();
      const total = students.length * attitudes.length;

      return { total, applied: total - failures.length, failures };
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["users", "students"] });
      void queryClient.invalidateQueries({ queryKey: ["rankings"] });
    },
  });
}
