"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import type { ClassFormInput } from "@/schemas/class";
import { createClass, updateClass } from "@/services/classes";

export type SaveClassInput = {
  classId: string | null;
  values: ClassFormInput;
};

export function useSaveClass() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, values }: SaveClassInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return classId
        ? updateClass(classId, values, token)
        : createClass({ name: values.name, teacher: values.teacher }, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classes"] }),
  });
}
