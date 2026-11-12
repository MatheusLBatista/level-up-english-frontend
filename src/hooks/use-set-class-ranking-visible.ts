"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { updateClass } from "@/services/classes";

export type SetClassRankingVisibleInput = {
  classId: string;
  visible: boolean;
};

/** Professor (dono da turma) ou admin mostra/esconde o ranking para os alunos. */
export function useSetClassRankingVisible() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, visible }: SetClassRankingVisibleInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return updateClass(classId, { class_ranking_visible: visible }, token);
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["classes"] }),
        queryClient.invalidateQueries({ queryKey: ["rankings"] }),
      ]),
  });
}
