"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import type { ClassSummary } from "@/lib/types";
import { updateClass } from "@/services/classes";

export type SetClassActiveInput = {
  schoolClass: ClassSummary;
  active: boolean;
};

export function useSetClassActive() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ schoolClass, active }: SetClassActiveInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return updateClass(schoolClass._id, { active }, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classes"] }),
  });
}
