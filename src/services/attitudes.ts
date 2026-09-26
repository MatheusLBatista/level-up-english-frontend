import { apiFetch } from "@/lib/api";
import type { Attitude, AttitudeLogResult, Paginated } from "@/lib/types";

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
