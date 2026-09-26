import type { Metadata } from "next";
import { RankingScreen } from "@/components/ranking/ranking-screen";
import { RoleGuard } from "@/components/auth/role-guard";

export const metadata: Metadata = {
  title: "Ranking",
};

export default function RankingPage() {
  return (
    <RoleGuard allow={["student"]}>
      <main className="flex flex-1 flex-col p-4 sm:p-6">
        <RankingScreen />
      </main>
    </RoleGuard>
  );
}
