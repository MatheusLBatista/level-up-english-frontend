"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import type { User } from "@/lib/types";
import { updateUser, type UpdateUserBody } from "@/services/users";

export type UpdateStudentInput = {
  student: User;
  body: UpdateUserBody;
};

export function useUpdateStudent() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ student, body }: UpdateStudentInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return updateUser(student._id, body, token);
    },
    // Mudar a turma mexe na contagem das turmas (o backend sincroniza os dois lados).
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["classes"] }),
      ]),
  });
}
