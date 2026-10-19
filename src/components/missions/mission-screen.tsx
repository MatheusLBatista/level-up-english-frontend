"use client";

import { ChevronRightIcon, SearchXIcon } from "lucide-react";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import { MissionAction } from "@/components/missions/mission-action";
import { MissionCard } from "@/components/missions/mission-card";
import { MissionTypeFilter } from "@/components/missions/mission-type-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMissions } from "@/hooks/use-mission";
import {
  indexProgress,
  isMissionPending,
  sortPendingMissions,
} from "@/lib/missions";
import type { Mission, MissionProgressEntry, MissionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const missionTypes = [
  "quiz",
  "vocabulary",
  "audio",
] as const satisfies MissionType[];

export function MissionsScreen() {
  const [{ tipo }, setFilters] = useQueryStates({
    tipo: parseAsStringLiteral(missionTypes),
  });

  const userQuery = useCurrentUser();
  const missionsQuery = useMissions({ type: tipo });

  const missions = missionsQuery.data?.docs ?? [];
  const progress = userQuery.data
    ? indexProgress(userQuery.data)
    : new Map<string, MissionProgressEntry>();
  const pending = sortPendingMissions(
    missions.filter((mission) =>
      isMissionPending(mission, progress.get(mission._id)),
    ),
    progress,
  );
  const finished = missions.filter(
    (mission) => !isMissionPending(mission, progress.get(mission._id)),
  );

  function renderGrid(items: Mission[]) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 transition-opacity lg:grid-cols-2",
          missionsQuery.isPlaceholderData && "opacity-60",
        )}
      >
        {items.map((mission) => (
          <MissionCard
            key={mission._id}
            mission={mission}
            progress={progress.get(mission._id)}
            action={
              <MissionAction
                mission={mission}
                progress={progress.get(mission._id)}
              />
            }
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-title font-semibold">Missões</h1>
          <p className="text-muted-foreground text-sm">
            {missionsQuery.isPending || userQuery.isPending
              ? "Carregando…"
              : pending.length === 0
                ? "Nada pendente agora"
                : `${pending.length} ${pending.length === 1 ? "missão ainda rende XP" : "missões ainda rendem XP"}`}
          </p>
        </div>

        <MissionTypeFilter
          value={tipo}
          onChange={(value) => setFilters({ tipo: value })}
        />
      </div>

      {missionsQuery.isPending || userQuery.isPending ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : missionsQuery.isError ? (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
          <p className="text-sm">{missionsQuery.error.message}</p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => void missionsQuery.refetch()}
          >
            Tentar de novo
          </Button>
        </div>
      ) : missions.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
          <SearchXIcon className="text-muted-foreground size-7" />
          <p className="text-sm font-medium">
            {tipo
              ? "Nenhuma missão desse tipo na sua turma."
              : "Sua turma ainda não tem missões publicadas."}
          </p>
          {tipo && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => setFilters({ tipo: null })}
            >
              Ver todas
            </Button>
          )}
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-4">
            <h2 className="font-heading text-heading font-semibold">
              Para fazer
            </h2>
            {pending.length > 0 ? (
              renderGrid(pending)
            ) : (
              <p className="border-border bg-card text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
                Você concluiu{" "}
                {tipo ? "as missões desse tipo" : "todas as missões"} com nota
                máxima. Quando seu professor publicar outra, ela aparece aqui.
              </p>
            )}
          </section>

          {finished.length > 0 && (
            <details
              className="group flex flex-col gap-4"
              open={pending.length === 0}
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
                <ChevronRightIcon className="text-muted-foreground size-5 transition-transform group-open:rotate-90" />
                <h2 className="font-heading text-heading font-semibold">
                  Concluídas
                </h2>
                <span className="text-muted-foreground text-sm tabular-nums">
                  {finished.length}
                </span>
              </summary>
              <div className="mt-4">{renderGrid(finished)}</div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
