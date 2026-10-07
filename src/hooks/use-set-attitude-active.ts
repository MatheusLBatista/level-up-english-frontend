"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import type { Attitude } from "@/lib/types";
import { updateAttitude } from "@/services/attitudes";

export type SetAttitudeActiveInput = {
  attitude: Attitude;
  active: boolean;
};

export function useSetAttitudeActive() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attitude, active }: SetAttitudeActiveInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return updateAttitude(attitude._id, { active }, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attitudes"] }),
  });
}
