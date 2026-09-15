"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import type { Role } from "@/lib/types";
import { getInitials } from "@/lib/user";

const roleLabels: Record<Role, string> = {
  student: "Aluno",
  teacher: "Professor",
  admin: "Administrador",
};

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="border-border/40 bg-background/20 sticky top-0 z-10 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-md sm:px-6">
      <SidebarTrigger className="-ml-1" />

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right leading-tight sm:block">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-muted-foreground text-xs">
            {user ? roleLabels[user.role] : ""}
          </p>
        </div>

        <Avatar className="ring-primary/40 size-9 ring-2">
          <AvatarFallback className="bg-brand-gradient text-xs font-semibold text-white">
            {user ? getInitials(user.name) : ""}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
