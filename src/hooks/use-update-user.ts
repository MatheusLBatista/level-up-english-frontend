"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import type { User } from "@/lib/types";
import { updateUser, type UpdateUserBody } from "@/services/users";

export type UpdateUserInput = {
  user: User;
  body: UpdateUserBody;
};

/** PATCH de aluno ou professor feito pelo admin (editar, desativar, reativar). */
export function useUpdateUser() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ user, body }: UpdateUserInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return updateUser(user._id, body, token);
    },
    // Turma e professor aparecem um na lista do outro: atualiza os dois lados.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["classes"] }),
      ]),
  });
}
