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
