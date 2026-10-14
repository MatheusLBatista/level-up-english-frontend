"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import type { User } from "@/lib/types";
import type { CreateTeacherInput, EditTeacherInput } from "@/schemas/teacher";
import { registerTeacher } from "@/services/auth";
import { updateClass } from "@/services/classes";
import { updateUser } from "@/services/users";

function useInvalidateSchool() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["users"] }),
      queryClient.invalidateQueries({ queryKey: ["classes"] }),
    ]);
}

export function useRegisterTeacher() {
  const { token } = useAuth();
  const invalidate = useInvalidateSchool();

  return useMutation({
    mutationFn: (values: CreateTeacherInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return registerTeacher(
        {
          name: values.name,
          email: values.email,
          classes: values.classes.length > 0 ? values.classes : undefined,
        },
        token,
      );
    },
    onSuccess: invalidate,
  });
}

export type EditTeacherVariables = {
  teacher: User;
  /** Turmas (ativas) que hoje são dele — base para saber o que mudou. */
  currentClassIds: string[];
  values: EditTeacherInput;
};

/**
 * Não existe um endpoint "editar professor com turmas": o nome é do usuário e o
 * professor é um campo da turma. São várias chamadas — nome (se mudou), turmas
 * novas (teacher = ele) e turmas desmarcadas (teacher = null).
 */
export function useEditTeacher() {
  const { token } = useAuth();
  const invalidate = useInvalidateSchool();

  return useMutation({
    mutationFn: async ({
      teacher,
      currentClassIds,
      values,
    }: EditTeacherVariables) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      const selected = new Set(values.classes);
      const current = new Set(currentClassIds);
      const added = values.classes.filter((id) => !current.has(id));
      const removed = currentClassIds.filter((id) => !selected.has(id));

      if (values.name !== teacher.name) {
        await updateUser(teacher._id, { name: values.name }, token);
      }

      const results = await Promise.allSettled([
        ...added.map((id) => updateClass(id, { teacher: teacher._id }, token)),
        ...removed.map((id) => updateClass(id, { teacher: null }, token)),
      ]);

      const failed = results.filter((result) => result.status === "rejected");

      if (failed.length > 0) {
        throw new Error(
          `${failed.length} de ${results.length} turmas não foram atualizadas. Confira a lista e tente de novo.`,
        );
      }
    },
    // Mesmo com falha parcial, parte das turmas mudou: a lista precisa refletir.
    onSettled: invalidate,
  });
}
