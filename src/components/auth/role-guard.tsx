"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getHomeRoute } from "@/lib/routes";
import type { Role } from "@/lib/types";

type RoleGuardProps = {
  allow: Role[];
  children: ReactNode;
};

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const router = useRouter();
  const { user } = useAuth();

  const isAllowed = user ? allow.includes(user.role) : false;

  useEffect(() => {
    if (user && !isAllowed) {
      router.replace(getHomeRoute(user.role));
    }
  }, [user, isAllowed, router]);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
