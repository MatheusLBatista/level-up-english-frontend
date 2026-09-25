import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { TeacherPanel } from "@/components/teacher/teacher-panel";

export const metadata: Metadata = {
  title: "Painel",
};

export default function PainelPage() {
  return (
    <RoleGuard allow={["teacher", "admin"]}>
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <TeacherPanel />
      </main>
    </RoleGuard>
  );
}
