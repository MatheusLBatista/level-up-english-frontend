"use client";

import { ChevronRightIcon, PartyPopperIcon } from "lucide-react";
import Link from "next/link";
import { MissionCard } from "@/components/dashboard/mission-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMissions } from "@/hooks/use-mission";
import { indexProgress, selectRecommended } from "@/lib/missions";
import { MissionDialog } from "@/components/dashboard/mission-dialog";

function MissionsGrid() {
  const userQuery = useCurrentUser();
  const missionsQuery = useMissions();

  if (userQuery.isPending || missionsQuery.isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-44 rounded-xl" />
        ))}
      </div>
    );
  }

  if (userQuery.isError || missionsQuery.isError) {
    const error = userQuery.error ?? missionsQuery.error;

    return (
      <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
        <p className="text-sm">{error?.message}</p>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() => {
            void userQuery.refetch();
            void missionsQuery.refetch();
          }}
        >
          Tentar de novo
        </Button>
      </div>
    );
  }

  const missions = missionsQuery.data.docs;
  const progress = indexProgress(userQuery.data);
  const recommended = selectRecommended(missions, userQuery.data);

  if (recommended.length === 0) {
    return (
      <div className="border-border/40 bg-card/40 flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center">
        <PartyPopperIcon className="text-brand-done size-7" />
        <p className="text-sm font-medium">
          {missions.length === 0
            ? "Sua turma ainda não tem missões publicadas."
            : "Você concluiu todas as missões da turma. Mandou bem!"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
       {recommended.map((mission) => (
        <MissionDialog
          key={mission._id}
          mission={mission}
          inProgress={progress.has(mission._id)}
        />
      ))}
    </div>
  );
}

export function RecommendedMissions() {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">
          Missões Recomendadas
        </h2>

        <Button asChild variant="link" className="text-primary">
          <Link href="/missoes">
            Ver Todas
            <ChevronRightIcon />
          </Link>
        </Button>
      </header>

      <MissionsGrid />
    </section>
  );
}
