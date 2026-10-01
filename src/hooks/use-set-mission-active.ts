"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import type { Mission } from "@/lib/types";
import { updateMission } from "@/services/missions";

export type SetMissionActiveInput = {
  mission: Mission;
  active: boolean;
};

export function useSetMissionActive() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mission, active }: SetMissionActiveInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return updateMission(mission._id, { active }, token);
    },
    
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["missions"] }),
  });
}
