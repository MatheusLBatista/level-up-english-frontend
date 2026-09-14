import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { TooltipProvider } from "radix-ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <QueryProvider>
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </NuqsAdapter>
  );
}
