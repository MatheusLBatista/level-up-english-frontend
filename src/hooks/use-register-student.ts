"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { NO_CLASS, type StudentFormInput } from "@/schemas/student";
import { registerStudent } from "@/services/auth";

export function useRegisterStudent() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: StudentFormInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return registerStudent(
        {
          name: values.name,
          email: values.email,
          class: values.class === NO_CLASS ? undefined : values.class,
        },
        token,
      );
    },
    // A turma ganha um aluno: as contagens de /turmas também mudam.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["classes"] }),
      ]),
  });
}
