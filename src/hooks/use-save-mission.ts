"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { toCreateMissionBody, toUpdateMissionBody } from "@/lib/mission-form";
import type { MissionFormInput } from "@/schemas/mission";
import { createMission, updateMission } from "@/services/missions";

export type SaveMissionInput = {
  missionId: string | null;
  values: MissionFormInput;
};

export function useSaveMission() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ missionId, values }: SaveMissionInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return missionId
        ? updateMission(missionId, toUpdateMissionBody(values), token)
        : createMission(toCreateMissionBody(values), token);
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["missions"] }),
        queryClient.invalidateQueries({ queryKey: ["classes"] }),
      ]),
  });
}
