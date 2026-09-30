import { apiFetch } from "@/lib/api";
import type {
  Mission,
  MissionProgressResult,
  MissionWriteResult,
  Paginated,
  QuizAnswer,
} from "@/lib/types";
import { MissionType } from "@/lib/types";

export function listMissions(token: string, filters: MissionFilters = {}) {
  const params = new URLSearchParams({ limit: String(filters.limit ?? 100) });

  if (!filters.includeInactive) {
    params.set("active", "true");
  }

  if (filters.classId) {
    params.set("class_id", filters.classId);
  }

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
  classId?: string | null;
  includeInactive?: boolean;
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

export type MissionQuestionInput = {
  question: string;
  options: Record<QuizAnswer, string>;
  correct_answer: QuizAnswer;
};

export type CreateMissionBody = {
  type: MissionType;
  title: string;
  description: string;
  xp_reward: number;
  class_id: string;
  questions?: MissionQuestionInput[];
  content?: string;
  content_url?: string;
};

export type UpdateMissionBody = Partial<Omit<CreateMissionBody, "type">> & {
  active?: boolean;
};

export function createMission(body: CreateMissionBody, token: string) {
  return apiFetch<MissionWriteResult>("/missions", {
    method: "POST",
    body,
    token,
  });
}

export function updateMission(
  id: string,
  body: UpdateMissionBody,
  token: string
) {
  return apiFetch<MissionWriteResult>(`/missions/${id}`, {
    method: "PATCH",
    body,
    token,
  });
}
