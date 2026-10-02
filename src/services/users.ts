import { apiFetch } from "@/lib/api";
import type { Paginated, User } from "@/lib/types";

export function getUserById(id: string, token: string) {
  return apiFetch<User>(`/users/${id}`, { token });
}

export type UpdateUserBody = {
  name?: string;
};

export function updateUser(id: string, body: UpdateUserBody, token: string) {
  return apiFetch<User>(`/users/${id}`, { method: "PATCH", body, token });
}

export function listStudentsByClass(classId: string, token: string) {
  const params = new URLSearchParams({
    role: "student",
    class: classId,
    active: "true",
    limit: "100",
  });

  return apiFetch<Paginated<User>>(`/users?${params}`, { token });
}

export function listActiveTeachers(token: string) {
  const params = new URLSearchParams({
    role: "teacher",
    active: "true",
    limit: "100",
  });

  return apiFetch<Paginated<User>>(`/users?${params}`, { token });
}

export type StudentFilters = {
  page?: number;
  limit?: number;
  name?: string;
  classId?: string | null;
  /** `null` traz ativos e inativos. */
  active?: boolean | null;
};

export function listStudents(token: string, filters: StudentFilters = {}) {
  const params = new URLSearchParams({
    role: "student",
    limit: String(filters.limit ?? 12),
    page: String(filters.page ?? 1),
  });

  if (filters.name) {
    // O backend usa o texto direto num $regex: escapar evita 500 com "(" ou "+".
    params.set("name", filters.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  }

  if (filters.classId) {
    params.set("class", filters.classId);
  }

  if (filters.active !== null && filters.active !== undefined) {
    params.set("active", String(filters.active));
  }

  return apiFetch<Paginated<User>>(`/users?${params}`, { token });
}
