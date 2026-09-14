import { apiFetch } from "@/lib/api";
import type { Mission, Paginated } from "@/lib/types";

export function listMissions(token: string) {
  return apiFetch<Paginated<Mission>>("/missions?active=true&limit=100", {
    token,
  });
}
