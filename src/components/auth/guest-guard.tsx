"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { getHomeRoute } from "@/lib/routes";

import { useAuth } from "@/contexts/auth-context";

export function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(getHomeRoute(user.role));
    }
  }, [status, user, router]);

  if (status !== "unauthenticated") {
    return (
      <div
        className="flex flex-1 items-center justify-center p-6"
        role="status"
        aria-live="polite"
      >
        <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
        <span className="sr-only">Verificando sua sessão…</span>
      </div>
    );
  }

  return <>{children}</>;
}
