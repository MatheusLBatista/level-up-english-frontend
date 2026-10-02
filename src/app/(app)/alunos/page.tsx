import type { Metadata } from "next";
import { StudentsScreen } from "@/components/admin/students/students-screen";
import { RoleGuard } from "@/components/auth/role-guard";

export const metadata: Metadata = {
  title: "Alunos",
};

export default function AlunosPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <main className="flex flex-1 flex-col p-4 sm:p-6">
        <StudentsScreen />
      </main>
    </RoleGuard>
  );
}
