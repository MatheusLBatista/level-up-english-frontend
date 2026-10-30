"use client";

import { NotificationBell } from "@/components/layout/notification-bell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserAvatar } from "@/components/shared/user-avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import type { Role } from "@/lib/types";

const roleLabels: Record<Role, string> = {
  student: "Aluno",
  teacher: "Professor",
  admin: "Administrador",
};

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="border-border bg-background sticky top-0 z-10 flex h-16 items-center gap-3 border-b px-4 sm:px-6">
      <SidebarTrigger className="-ml-1" />

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        {user?.role === "student" && <NotificationBell />}
        <div className="hidden text-right leading-tight sm:block">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-muted-foreground text-xs">
            {user ? roleLabels[user.role] : ""}
          </p>
        </div>

        {user && (
          <UserAvatar
            user={user}
            className="ring-primary/40 size-9 ring-2"
            fallbackClassName="text-xs"
          />
        )}
      </div>
    </header>
  );
}
