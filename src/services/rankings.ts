import { apiFetch } from "@/lib/api";
import type { Ranking } from "@/lib/types";

export function getGlobalRanking(token: string) {
  return apiFetch<Ranking>("/rankings/global", { token });
}

export function getMyClassRanking(token: string) {
  return apiFetch<Ranking>("/rankings/me", { token });
}
