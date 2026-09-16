"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { useAuth } from "@/contexts/auth-context";

export function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

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
