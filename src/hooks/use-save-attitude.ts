"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { toAttitudeBody } from "@/lib/attitudes";
import type { AttitudeFormInput } from "@/schemas/attitude";
import { createAttitude, updateAttitude } from "@/services/attitudes";

export type SaveAttitudeInput = {
  /** `null` cria uma atitude nova. */
  attitudeId: string | null;
  values: AttitudeFormInput;
};

export function useSaveAttitude() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attitudeId, values }: SaveAttitudeInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      const body = toAttitudeBody(values);

      return attitudeId
        ? updateAttitude(attitudeId, body, token)
        : createAttitude(body, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attitudes"] }),
  });
}
