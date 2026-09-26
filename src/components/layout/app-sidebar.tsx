"use client";

import {
  Gamepad2Icon,
  LayoutGridIcon,
  LogOutIcon,
  TrophyIcon,
  UserRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getHomeRoute } from "@/lib/routes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";

const studentNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGridIcon },
  { href: "/missoes", label: "Missões", icon: Gamepad2Icon },
  { href: "/ranking", label: "Ranking", icon: TrophyIcon },
  { href: "/perfil", label: "Perfil", icon: UserRoundIcon },
];

const teacherNav = [
  { href: "/painel", label: "Painel", icon: LayoutGridIcon },
  { href: "/missoes", label: "Missões", icon: Gamepad2Icon },
  { href: "/perfil", label: "Perfil", icon: UserRoundIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = user?.role === "student" ? studentNav : teacherNav;
  const homeHref = user ? getHomeRoute(user.role) : "/dashboard";

  return (
    <Sidebar collapsible="icon">
       <SidebarHeader className="h-16 justify-center p-4 group-data-[collapsible=icon]:p-2">
        <Link href={homeHref} className="flex items-center gap-3">
          <span className="bg-brand-gradient grid size-9 shrink-0 place-items-center rounded-xl group-data-[collapsible=icon]:size-8">
            <Gamepad2Icon className="size-5 text-white group-data-[collapsible=icon]:size-4" />
          </span>
          <span className="grid group-data-[collapsible=icon]:hidden">
            <span className="text-sm leading-tight font-semibold">
              LevelUp English
            </span>
            <span className="text-sidebar-foreground/60 text-[10px] font-medium tracking-[0.18em] uppercase">
              English Learning
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href || pathname.startsWith(`${href}/`)}
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              tooltip="Sair"
              className="text-destructive hover:text-destructive"
            >
              <LogOutIcon />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
