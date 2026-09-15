"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Gamepad2Icon,
  SearchXIcon,
} from "lucide-react";
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { MissionDialog } from "@/components/missions/mission-dialog";
import { MissionTypeFilter } from "@/components/missions/mission-type-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMissions } from "@/hooks/use-mission";
import { indexProgress } from "@/lib/missions";
import type { MissionProgressEntry, MissionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

const missionTypes = [
  "quiz",
  "vocabulary",
  "audio",
] as const satisfies MissionType[];

export function MissionsScreen() {
  const [{ tipo, pagina }, setFilters] = useQueryStates({
    tipo: parseAsStringLiteral(missionTypes),
    pagina: parseAsInteger.withDefault(1),
  });

  const userQuery = useCurrentUser();
  const missionsQuery = useMissions({
    type: tipo,
    page: pagina,
    limit: PAGE_SIZE,
  });

  const page = missionsQuery.data;
  const missions = page?.docs ?? [];
  const total = page?.totalDocs ?? 0;
  const progress = userQuery.data
    ? indexProgress(userQuery.data)
    : new Map<string, MissionProgressEntry>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Gamepad2Icon className="text-primary size-8" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Missões Disponíveis
            </h1>
            <p className="text-muted-foreground text-sm">
              {missionsQuery.isPending
                ? "Carregando…"
                : `${total} ${total === 1 ? "missão disponível" : "missões disponíveis"}`}
            </p>
          </div>
        </div>

        <MissionTypeFilter
          value={tipo}
          onChange={(value) => setFilters({ tipo: value, pagina: 1 })}
        />
      </div>

      {missionsQuery.isPending ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
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
        <div className="border-border/40 bg-card/40 flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
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
              onClick={() => setFilters({ tipo: null, pagina: 1 })}
            >
              Ver todas
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity lg:grid-cols-2",
            missionsQuery.isPlaceholderData && "opacity-60",
          )}
        >
          {missions.map((mission) => (
            <MissionDialog
              key={mission._id}
              mission={mission}
              progress={progress.get(mission._id)}
              withAction
            />
          ))}
        </div>
      )}

      {page && page.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={!page.hasPrevPage}
            onClick={() => setFilters({ pagina: page.page - 1 })}
          >
            <ChevronLeftIcon />
            Anterior
          </Button>

          <span className="text-muted-foreground text-sm tabular-nums">
            Página {page.page} de {page.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={!page.hasNextPage}
            onClick={() => setFilters({ pagina: page.page + 1 })}
          >
            Próxima
            <ChevronRightIcon />
          </Button>
        </div>
      )}
    </div>
  );
}
