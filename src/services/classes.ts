import { apiFetch } from "@/lib/api";
import type { ClassSummary, Paginated, SchoolClass } from "@/lib/types";

export function getClassById(id: string, token: string) {
  return apiFetch<SchoolClass>(`/classes/${id}`, { token });
}

export type ClassFilters = {
  teacher?: string;
  /** `null` traz ativas e inativas. Sem valor, só as ativas. */
  active?: boolean | null;
};

export function listClasses(token: string, filters: ClassFilters = {}) {
  const params = new URLSearchParams({ limit: "100" });
  const active = filters.active === undefined ? true : filters.active;

  if (active !== null) {
    params.set("active", String(active));
  }

  if (filters.teacher) {
    params.set("teacher", filters.teacher);
  }

  return apiFetch<Paginated<ClassSummary>>(`/classes?${params}`, { token });
}

export type ClassWriteResult = Omit<ClassSummary, "teacher"> & {
  teacher: string | null;
};

export type SaveClassBody = {
  name: string;
  teacher: string;
  active?: boolean;
};

export function createClass(body: SaveClassBody, token: string) {
  return apiFetch<ClassWriteResult>("/classes", {
    method: "POST",
    body,
    token,
  });
}

export function updateClass(
  id: string,
  body: Partial<SaveClassBody>,
  token: string,
) {
  return apiFetch<ClassWriteResult>(`/classes/${id}`, {
    method: "PATCH",
    body,
    token,
  });
}
