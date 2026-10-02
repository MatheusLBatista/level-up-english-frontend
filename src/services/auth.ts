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

export function forgotPassword(email: string) {
  return apiFetch<null>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export type ResetPasswordBody = {
  code: string;
  newPassword: string;
};

export function resetPassword(body: ResetPasswordBody) {
  return apiFetch<null>("/auth/reset-password", {
    method: "POST",
    body,
  });
}

export type RegisterTeacherBody = {
  name: string;
  email: string;
  classes?: string[];
};

export function registerTeacher(body: RegisterTeacherBody, token: string) {
  return apiFetch<User>("/auth/register-teacher", {
    method: "POST",
    body,
    token,
  });
}
