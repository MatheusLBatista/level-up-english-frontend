import { apiFetch } from "@/lib/api";
import type {
  Attitude,
  AttitudeLog,
  AttitudeLogResult,
  AttitudeType,
  Paginated,
} from "@/lib/types";

/** `null` traz ativas e desativadas. */
export function listAttitudes(token: string, active: boolean | null = true) {
  const params = new URLSearchParams({ limit: "100" });

  if (active !== null) {
    params.set("active", String(active));
  }

  return apiFetch<Paginated<Attitude>>(`/attitudes?${params}`, { token });
}

export type CreateAttitudeBody = {
  name: string;
  description?: string;
  xp_value: number;
  type: AttitudeType;
};

export function createAttitude(body: CreateAttitudeBody, token: string) {
  return apiFetch<Attitude>("/attitudes", {
    method: "POST",
    body,
    token,
  });
}

export type UpdateAttitudeBody = {
  name?: string;
  description?: string;
  xp_value?: number;
  type?: AttitudeType;
  active?: boolean;
};

export function updateAttitude(
  id: string,
  body: UpdateAttitudeBody,
  token: string,
) {
  return apiFetch<Attitude>(`/attitudes/${id}`, {
    method: "PATCH",
    body,
    token,
  });
}

export type ApplyAttitudeBody = {
  student: string;
  attitude: string;
};

export function applyAttitude(body: ApplyAttitudeBody, token: string) {
  return apiFetch<AttitudeLogResult>("/attitude-logs", {
    method: "POST",
    body,
    token,
  });
}

export type AttitudeLogFilters = {
  teacher?: string;
  student?: string;
  limit?: number;
};

export function listAttitudeLogs(
  token: string,
  filters: AttitudeLogFilters = {},
) {
  const params = new URLSearchParams({ limit: String(filters.limit ?? 10) });

  if (filters.teacher) {
    params.set("teacher", filters.teacher);
  }

  if (filters.student) {
    params.set("student", filters.student);
  }

  return apiFetch<Paginated<AttitudeLog>>(`/attitude-logs?${params}`, {
    token,
  });
}
