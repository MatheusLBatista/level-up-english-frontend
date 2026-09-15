import type { Metadata } from "next";
import { RankingScreen } from "@/components/ranking/ranking-screen";

export const metadata: Metadata = {
  title: "Ranking",
};

export default function RankingPage() {
  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6">
      <RankingScreen />
    </main>
  );
}
