import type { Metadata } from "next";
import { ClassesScreen } from "@/components/admin/classes-screen";
import { RoleGuard } from "@/components/auth/role-guard";

export const metadata: Metadata = {
  title: "Turmas",
};

export default function TurmasPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <main className="flex flex-1 flex-col p-4 sm:p-6">
        <ClassesScreen />
      </main>
    </RoleGuard>
  );
}
