import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

export function getUserById(id: string, token: string) {
  return apiFetch<User>(`/users/${id}`, { token });
}
