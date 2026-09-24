import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";

export const metadata: Metadata = {
  title: "Painel",
};

export default function PainelPage() {
  return (
    <RoleGuard allow={["teacher", "admin"]}>
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Painel do professor
        </h1>
      </main>
    </RoleGuard>
  );
}
