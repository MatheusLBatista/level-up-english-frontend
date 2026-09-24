import type { Role } from "@/lib/types";

//TODO: revisar roles
export function getHomeRoute(role: Role) {
  return role === "student" ? "/dashboard" : "/painel";
}
