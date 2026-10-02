import type { Metadata } from "next";
import { AdminOverviewScreen } from "@/components/admin/admin-overview-screen";
import { RoleGuard } from "@/components/auth/role-guard";

export const metadata: Metadata = {
  title: "Geral",
};

export default function GeralPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <main className="flex flex-1 flex-col p-4 sm:p-6">
        <AdminOverviewScreen />
      </main>
    </RoleGuard>
  );
}
