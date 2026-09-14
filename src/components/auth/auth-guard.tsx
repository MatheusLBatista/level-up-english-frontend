"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { useAuth } from "@/contexts/auth-context";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
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
