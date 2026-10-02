import { apiFetch } from "@/lib/api";
import type { Attitude, AttitudeLog, AttitudeLogResult, Paginated } from "@/lib/types";

export function listAttitudes(token: string) {
  const params = new URLSearchParams({ active: "true", limit: "100" });

  return apiFetch<Paginated<Attitude>>(`/attitudes?${params}`, { token });
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

export function listAttitudeLogs(token: string, filters: AttitudeLogFilters = {}) {
  const params = new URLSearchParams({ limit: String(filters.limit ?? 10) });

  if (filters.teacher) {
    params.set("teacher", filters.teacher);
  }

  if (filters.student) {
    params.set("student", filters.student);
  }

  return apiFetch<Paginated<AttitudeLog>>(`/attitude-logs?${params}`, { token });
}
