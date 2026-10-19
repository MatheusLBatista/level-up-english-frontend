import type { Metadata } from "next";
import { RoleGuard } from "@/components/auth/role-guard";
import { MissionPlayer } from "@/components/missions/mission-player";

export const metadata: Metadata = {
  title: "Missão",
};

type MissaoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MissaoPage({ params }: MissaoPageProps) {
  const { id } = await params;

  return (
    <RoleGuard allow={["student"]}>
      <main className="flex flex-1 flex-col p-4 sm:p-6">
        <MissionPlayer missionId={id} />
      </main>
    </RoleGuard>
  );
}
