import type { Metadata } from "next";
import { TeachersScreen } from "@/components/admin/teachers/teachers-screen";
import { RoleGuard } from "@/components/auth/role-guard";

export const metadata: Metadata = {
  title: "Professores",
};

export default function ProfessoresPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <main className="flex flex-1 flex-col p-4 sm:p-6">
        <TeachersScreen />
      </main>
    </RoleGuard>
  );
}
