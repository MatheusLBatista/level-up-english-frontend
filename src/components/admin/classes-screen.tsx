"use client";

import {
  BookOpenIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  SearchXIcon,
  Trash2Icon,
} from "lucide-react";
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useState } from "react";
import { ClassFormDialog } from "@/components/admin/class-form-dialog";
import { ClassRow } from "@/components/admin/class-row";
import { DeactivateClassDialog } from "@/components/admin/deactivate-class-dialog";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { classStatuses, useAdminClasses } from "@/hooks/use-admin-classes";
import { useSetClassActive } from "@/hooks/use-set-class-active";
import { paginate } from "@/lib/paginate";
import { matchesSearch } from "@/lib/text";
import type { ClassSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

const statusOptions = [
  { value: "ativas", label: "Ativas" },
  { value: "inativas", label: "Inativas" },
  { value: "todas", label: "Todas" },
] as const;

const emptyMessages = {
  ativas: "Nenhuma turma ativa.",
  inativas: "Nenhuma turma inativa.",
  todas: "Nenhuma turma cadastrada ainda.",
} as const;

export function ClassesScreen() {
  const [{ status, pagina }, setFilters] = useQueryStates({
    status: parseAsStringLiteral(classStatuses).withDefault("ativas"),
    pagina: parseAsInteger.withDefault(1),
  });
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<ClassSummary | null>(null);

  function openCreate() {
    setClassToEdit(null);
    setFormOpen(true);
  }

  function openEdit(item: ClassSummary) {
    setClassToEdit(item);
    setFormOpen(true);
  }

  const [classToDeactivate, setClassToDeactivate] =
    useState<ClassSummary | null>(null);
  const reactivate = useSetClassActive();

  function handleToggleActive(item: ClassSummary) {
    if (item.active) {
      setClassToDeactivate(item);
    } else {
      reactivate.mutate({ schoolClass: item, active: true });
    }
  }

  const classesQuery = useAdminClasses(status);
  const classes = (classesQuery.data ?? []).filter(
    (item) =>
      matchesSearch(item.name, search) ||
      matchesSearch(item.teacher?.name ?? "", search),
  );
  const page = paginate(classes, pagina, PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="text-primary size-8" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Turmas</h1>
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Gestão de turmas e professores
            </p>
          </div>
        </div>

        <Button className="bg-brand-gradient" onClick={openCreate}>
          <PlusIcon />
          Nova turma
        </Button>
      </div>

      <div className="border-border/40 bg-card/60 flex flex-col gap-3 rounded-2xl border p-3 backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              void setFilters({ pagina: 1 });
            }}
            placeholder="Buscar por turma ou professor…"
            aria-label="Buscar turma"
            className="pl-9"
          />
        </div>

        <SegmentedFilter
          label="Filtrar turmas por status"
          options={statusOptions}
          value={status}
          onChange={(next) => void setFilters({ status: next, pagina: 1 })}
        />
      </div>

      {reactivate.isError && (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-3">
          <p className="text-sm">
            Não foi possível reativar “{reactivate.variables?.schoolClass.name}”:{" "}
            {reactivate.error.message}
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={() => reactivate.reset()}
          >
            Fechar
          </Button>
        </div>
      )}

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
          {page.docs.map((item) => {
            const busy =
              reactivate.isPending &&
              reactivate.variables?.schoolClass._id === item._id;

            return (
              <ClassRow
                key={item._id}
                item={item}
                actions={
                  <>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Editar ${item.name}`}
                      title="Editar"
                      onClick={() => openEdit(item)}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={
                        item.active
                          ? `Desativar ${item.name}`
                          : `Reativar ${item.name}`
                      }
                      title={item.active ? "Desativar" : "Reativar"}
                      className={
                        item.active
                          ? "hover:text-destructive"
                          : "hover:text-brand-done"
                      }
                      disabled={busy}
                      onClick={() => handleToggleActive(item)}
                    >
                      {busy ? (
                        <Loader2Icon className="animate-spin" />
                      ) : item.active ? (
                        <Trash2Icon />
                      ) : (
                        <RotateCcwIcon />
                      )}
                    </Button>
                  </>
                }
              />
            );
          })}
        </ul>
      )}

      {!classesQuery.isPending && !classesQuery.isError && (
        <PaginationControls
          page={page}
          onChange={(value) => void setFilters({ pagina: value })}
        />
      )}

      <ClassFormDialog
        open={formOpen}
        schoolClass={classToEdit}
        onClose={() => setFormOpen(false)}
      />

      <DeactivateClassDialog
        schoolClass={classToDeactivate}
        onClose={() => setClassToDeactivate(null)}
      />
    </div>
  );
}
