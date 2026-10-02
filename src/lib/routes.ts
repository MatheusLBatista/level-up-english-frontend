import type { Role } from "@/lib/types";

const homeRoutes: Record<Role, string> = {
  student: "/dashboard",
  teacher: "/painel",
  admin: "/turmas",
};

export function getHomeRoute(role: Role) {
  return homeRoutes[role];
}
