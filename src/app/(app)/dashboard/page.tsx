import type { Metadata } from "next";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardPerformance } from "@/components/dashboard/performance";
import { WelcomeBanner } from "@/components/dashboard/banner";
import { RecommendedMissions } from "@/components/dashboard/recommended-missions";
import { XpHistory } from "@/components/dashboard/xp-history";
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
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <DashboardPerformance />
          <XpHistory />
        </div>
      </main>
    </RoleGuard>
  );
}
