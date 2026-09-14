import { apiFetch } from "@/lib/api";
import type {
  Mission,
  MissionProgressResult,
  Paginated,
  QuizAnswer,
} from "@/lib/types";

export function listMissions(token: string) {
  return apiFetch<Paginated<Mission>>("/missions?active=true&limit=100", {
    token,
  });
}

export type SubmitProgressBody = {
  done: boolean;
  score?: number;
  answers?: QuizAnswer[];
};

export function submitMissionProgress(
  missionId: string,
  body: SubmitProgressBody,
  token: string,
) {
  return apiFetch<MissionProgressResult>(`/missions/${missionId}/progress`, {
    method: "POST",
    body,
    token,
  });
}
