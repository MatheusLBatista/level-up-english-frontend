import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-app-gradient">
          <AppHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
