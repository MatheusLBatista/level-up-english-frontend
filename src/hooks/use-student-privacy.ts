"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { dataExportFileName } from "@/lib/consent";
import type { User } from "@/lib/types";
import {
  eraseStudentData,
  exportStudentData,
  recordGuardianConsent,
  revokeGuardianConsent,
} from "@/services/users";

const SESSION_EXPIRED = "Sua sessão expirou. Entre de novo para continuar.";

/**
 * Os quatro casos mudam a situação do aluno nas listas; revogar e eliminar
 * também mexem nos rankings (aluno desativado sai deles) e nas contagens.
 */
function useStudentMutation(
  action: (id: string, token: string) => Promise<User>,
  { affectsRankings }: { affectsRankings: boolean },
) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (student: User) => {
      if (!token) {
        throw new Error(SESSION_EXPIRED);
      }

      return action(student._id, token);
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        affectsRankings &&
          queryClient.invalidateQueries({ queryKey: ["rankings"] }),
        affectsRankings &&
          queryClient.invalidateQueries({ queryKey: ["classes"] }),
      ]),
  });
}

export function useRecordGuardianConsent() {
  return useStudentMutation(recordGuardianConsent, { affectsRankings: false });
}

export function useRevokeGuardianConsent() {
  return useStudentMutation(revokeGuardianConsent, { affectsRankings: true });
}

export function useEraseStudentData() {
  return useStudentMutation(eraseStudentData, { affectsRankings: true });
}

/** Baixa um arquivo no navegador sem sair da página. */
function downloadJson(data: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Exportação é leitura, mas vira mutation: só roda no clique e não deve ficar
 * em cache (são dados pessoais).
 */
export function useExportStudentData() {
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (student: User) => {
      if (!token) {
        throw new Error(SESSION_EXPIRED);
      }

      const data = await exportStudentData(student._id, token);
      downloadJson(
        data,
        dataExportFileName(data.student._id, data.exported_at),
      );

      return data;
    },
  });
}
