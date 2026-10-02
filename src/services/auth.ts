import { apiFetch } from "@/lib/api";
import type { LoginResponse, User } from "@/lib/types";
import type { LoginInput } from "@/schemas/auth";

export function login(creditials: LoginInput) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: creditials,
  });
}

export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export function changePassword(body: ChangePasswordBody, token: string) {
  return apiFetch<null>("/auth/change-password", {
    method: "PATCH",
    body,
    token,
  });
}

export type RegisterStudentBody = {
  name: string;
  email: string;
  class?: string;
};

export function registerStudent(body: RegisterStudentBody, token: string) {
  return apiFetch<User>("/auth/register-student", {
    method: "POST",
    body,
    token,
  });
}
