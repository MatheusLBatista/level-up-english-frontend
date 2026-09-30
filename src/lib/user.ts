import type { Role } from "./types";

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts.at(0)?.[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";

  return (first + last).toUpperCase();
}

export const roleLabels: Record<Role, string> = {
  student: "Aluno",
  teacher: "Professor",
  admin: "Administrador",
};
