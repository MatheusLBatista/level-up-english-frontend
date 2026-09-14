"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import {
  submitMissionProgress,
  type SubmitProgressBody,
} from "@/services/missions";

export function useSubmitMissionProgress(missionId: string) {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SubmitProgressBody) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return submitMissionProgress(missionId, body, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users", user?._id] });
      void queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
}
