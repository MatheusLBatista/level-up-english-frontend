import { apiFetch } from "@/lib/api";
import type { ClassSummary, Paginated, SchoolClass } from "@/lib/types";

export function getClassById(id: string, token: string) {
  return apiFetch<SchoolClass>(`/classes/${id}`, { token });
}

export function listClasses(token: string, filters: { teacher?: string } = {}) {
  const params = new URLSearchParams({ active: "true", limit: "100" });

  if (filters.teacher) {
    params.set("teacher", filters.teacher);
  }

  return apiFetch<Paginated<ClassSummary>>(`/classes?${params}`, { token });
}
