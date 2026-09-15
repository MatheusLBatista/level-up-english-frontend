import { apiFetch } from "@/lib/api";
import type {
  Mission,
  MissionProgressResult,
  Paginated,
  QuizAnswer,
} from "@/lib/types";
import { MissionType } from "@/lib/types";

export function listMissions(token: string, filters: MissionFilters = {}) {
  const params = new URLSearchParams({
    active: "true",
    limit: String(filters.limit ?? 100),
  });

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  return apiFetch<Paginated<Mission>>(`/missions?${params}`, { token });
}

export type MissionFilters = {
  type?: MissionType | null;
  page?: number;
  limit?: number;
};

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
