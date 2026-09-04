import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/contexts/auth-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </NuqsAdapter>
  );
}
