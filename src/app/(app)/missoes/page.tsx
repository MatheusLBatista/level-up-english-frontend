import type { Metadata } from "next";
import { MissionsByRole } from "@/components/missions/missions-by-role";

export const metadata: Metadata = {
  title: "Missões",
};

export default function MissoesPage() {
  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6">
      <MissionsByRole />
    </main>
  );
}
