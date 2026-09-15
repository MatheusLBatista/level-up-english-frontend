import { apiFetch } from "@/lib/api";
import type { LoginResponse } from "@/lib/types";
import type { LoginInput } from "@/schemas/auth";

export function login(creditials: LoginInput) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: creditials,
  });
}
