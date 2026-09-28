"use client";

import { Gamepad2Icon, PlusIcon, SearchXIcon } from "lucide-react";
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { ManageMissionCard } from "@/components/missions/manage-mission-card";
import { MissionPagination } from "@/components/missions/mission-pagination";
import { MissionTypeFilter } from "@/components/missions/mission-type-filter";
import { ClassSelect } from "@/components/teacher/class-select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useMissions } from "@/hooks/use-mission";
import { useSelectedClass } from "@/hooks/use-selected-class";
import type { Mission, MissionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

const missionTypes = [
  "quiz",
  "vocabulary",
  "audio",
] as const satisfies MissionType[];

export function TeacherMissionsScreen() {
  const { user } = useAuth();
  const { classesQuery, classes, classId, setClassId } = useSelectedClass();
  const [{ tipo, pagina }, setFilters] = useQueryStates({
    tipo: parseAsStringLiteral(missionTypes),
    pagina: parseAsInteger.withDefault(1),
  });

  const missionsQuery = useMissions(
    { classId, type: tipo, page: pagina, limit: PAGE_SIZE, includeInactive: true },
    Boolean(classId),
  );

  const page = missionsQuery.data;
  const missions = page?.docs ?? [];

  function canManage(mission: Mission) {
    return user?.role === "admin" || mission.createdBy?._id === user?._id;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Gamepad2Icon className="text-primary size-8" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Missões</h1>
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Gerenciar conteúdos
            </p>
          </div>
        </div>

        <Button className="bg-brand-gradient" disabled>
          <PlusIcon />
          Criar missão
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ClassSelect
          classes={classes}
          value={classId}
          isPending={classesQuery.isPending}
          onChange={(value) => {
            void setClassId(value);
            void setFilters({ pagina: 1 });
          }}
        />
        <MissionTypeFilter
          value={tipo}
          onChange={(value) => void setFilters({ tipo: value, pagina: 1 })}
        />
      </div>

      {classesQuery.isError || missionsQuery.isError ? (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
          <p className="text-sm">
            {(classesQuery.error ?? missionsQuery.error)?.message}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() =>
              void (classesQuery.isError ? classesQuery.refetch() : missionsQuery.refetch())
            }
          >
            Tentar de novo
          </Button>
        </div>
      ) : classesQuery.isPending || (classId && missionsQuery.isPending) ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : missions.length === 0 ? (
        <div className="border-border/40 bg-card/40 flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
          <SearchXIcon className="text-muted-foreground size-7" />
          <p className="text-sm font-medium">
            {!classId
              ? "Você ainda não tem turmas."
              : tipo
                ? "Nenhuma missão desse tipo nesta turma."
                : "Esta turma ainda não tem missões. Crie a primeira!"}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity lg:grid-cols-2",
            missionsQuery.isPlaceholderData && "opacity-60",
          )}
        >
          {missions.map((mission) => (
            <ManageMissionCard
              key={mission._id}
              mission={mission}
              canManage={canManage(mission)}
            />
          ))}
        </div>
      )}

      {page && (
        <MissionPagination
          page={page}
          onChange={(value) => void setFilters({ pagina: value })}
        />
      )}
    </div>
  );
}
