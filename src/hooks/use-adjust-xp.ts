"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import type { User } from "@/lib/types";
import { createXpAdjustment } from "@/services/xp-adjustments";

export type AdjustXpInput = {
  students: User[];
  amount: number;
  reason?: string;
};

export type AdjustXpSummary = {
  amount: number;
  succeeded: { student: User; xpApplied: number }[];
  failures: { student: User; message: string }[];
};

export function useAdjustXp() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      students,
      amount,
      reason,
    }: AdjustXpInput): Promise<AdjustXpSummary> => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      // Uma requisição por aluno: nenhuma disputa o mesmo documento, então
      // tudo pode ir em paralelo.
      const results = await Promise.allSettled(
        students.map((student) =>
          createXpAdjustment({ student: student._id, amount, reason }, token),
        ),
      );

      const summary: AdjustXpSummary = { amount, succeeded: [], failures: [] };

      results.forEach((result, index) => {
        const student = students[index];

        if (result.status === "fulfilled") {
          summary.succeeded.push({
            student,
            xpApplied: result.value.xp_applied,
          });
        } else {
          summary.failures.push({
            student,
            message:
              result.reason instanceof Error
                ? result.reason.message
                : "Erro desconhecido.",
          });
        }
      });

      return summary;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["users", "students"] });
      void queryClient.invalidateQueries({ queryKey: ["rankings"] });
    },
  });
}
