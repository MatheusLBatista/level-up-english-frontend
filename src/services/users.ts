import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

export function getUserById(id: string, token: string) {
  return apiFetch<User>(`/users/${id}`, { token });
}

export type UpdateUserBody = {
  name?: string;
};

export function updateUser(id: string, body: UpdateUserBody, token: string) {
  return apiFetch<User>(`/users/${id}`, { method: "PATCH", body, token });
}
