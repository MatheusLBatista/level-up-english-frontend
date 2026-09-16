import { apiFetch } from "@/lib/api";
import type { SchoolClass } from "@/lib/types";

export function getClassById(id: string, token: string) {
  return apiFetch<SchoolClass>(`/classes/${id}`, { token })
}
