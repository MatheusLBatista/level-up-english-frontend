import type { Metadata } from "next";
import { AttitudesScreen } from "@/components/admin/attitudes/attitudes-screen";
import { RoleGuard } from "@/components/auth/role-guard";

export const metadata: Metadata = {
  title: "Atitudes",
};

export default function AtitudesPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <main className="flex flex-1 flex-col p-4 sm:p-6">
        <AttitudesScreen />
      </main>
    </RoleGuard>
  );
}
