import type { Metadata } from "next";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { WelcomeBanner } from "@/components/dashboard/banner";
import { RecommendedMissions } from "@/components/dashboard/recommended-missions";
import { RoleGuard } from "@/components/auth/role-guard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <RoleGuard allow={["student"]}>
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <WelcomeBanner />
        <DashboardStats />
        <RecommendedMissions />
      </main>
    </RoleGuard>
  );
}
