"use client";

import { BookOpenIcon, SearchIcon, SearchXIcon } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";
import { ClassRow } from "@/components/admin/class-row";
import { ClassStatusFilter } from "@/components/admin/class-status-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { classStatuses, useAdminClasses } from "@/hooks/use-admin-classes";
import { matchesSearch } from "@/lib/text";
import { cn } from "@/lib/utils";

const emptyMessages = {
  ativas: "Nenhuma turma ativa.",
  inativas: "Nenhuma turma inativa.",
  todas: "Nenhuma turma cadastrada ainda.",
} as const;

export function ClassesScreen() {
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(classStatuses).withDefault("ativas"),
  );
  const [search, setSearch] = useState("");

  const classesQuery = useAdminClasses(status);
  const classes = (classesQuery.data ?? []).filter(
    (item) =>
      matchesSearch(item.name, search) ||
      matchesSearch(item.teacher?.name ?? "", search),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BookOpenIcon className="text-primary size-8" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Turmas</h1>
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Gestão de turmas e professores
          </p>
        </div>
      </div>

      <div className="border-border/40 bg-card/60 flex flex-col gap-3 rounded-2xl border p-3 backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por turma ou professor…"
            aria-label="Buscar turma"
            className="pl-9"
          />
        </div>

        <ClassStatusFilter value={status} onChange={(next) => void setStatus(next)} />
      </div>

      {classesQuery.isPending ? (
        <div className="border-border/40 bg-card/60 divide-border/40 flex flex-col divide-y rounded-2xl border">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="px-4 py-3">
              <Skeleton className="h-11 rounded-lg" />
            </div>
          ))}
        </div>
      ) : classesQuery.isError ? (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
          <p className="text-sm">{classesQuery.error.message}</p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => void classesQuery.refetch()}
          >
            Tentar de novo
          </Button>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-muted-foreground border-border/40 flex flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center text-sm">
          <SearchXIcon className="size-6" />
          {search.trim()
            ? `Nenhuma turma encontrada para "${search.trim()}".`
            : emptyMessages[status]}
        </div>
      ) : (
        <ul
          className={cn(
            "border-border/40 bg-card/60 divide-border/40 divide-y rounded-2xl border backdrop-blur-sm transition-opacity",
            classesQuery.isPlaceholderData && "opacity-60",
          )}
        >
          {classes.map((item) => (
            <ClassRow key={item._id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
