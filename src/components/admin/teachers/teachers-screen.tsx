"use client";

import {
  GraduationCapIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  SearchXIcon,
  Trash2Icon,
} from "lucide-react";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { useState, type ReactNode } from "react";
import { CreateTeacherDialog } from "@/components/admin/teachers/create-teacher-dialog";
import { DeactivateTeacherDialog } from "@/components/admin/teachers/deactivate-teacher-dialog";
import { EditTeacherDialog } from "@/components/admin/teachers/edit-teacher-dialog";
import { TeacherRow } from "@/components/admin/teachers/teacher-row";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminClasses } from "@/hooks/use-admin-classes";
import { useTeachers } from "@/hooks/use-teachers";
import { useUpdateUser } from "@/hooks/use-update-user";
import { paginate } from "@/lib/paginate";
import { matchesSearch } from "@/lib/text";
import type { ClassSummary, User } from "@/lib/types";

const PAGE_SIZE = 10;

const teacherStatuses = ["ativos", "desativados"] as const;

const statusOptions = [
  { value: "ativos", label: "Ativos" },
  { value: "desativados", label: "Desativados" },
] as const;

export function TeachersScreen() {
  const [{ status, pagina, busca }, setFilters] = useQueryStates({
    status: parseAsStringLiteral(teacherStatuses).withDefault("ativos"),
    pagina: parseAsInteger.withDefault(1),
    busca: parseAsString.withDefault(""),
  });

  const teachersQuery = useTeachers(status === "ativos");
  const classesQuery = useAdminClasses("ativas");

  const classesByTeacher = new Map<string, ClassSummary[]>();
  for (const item of classesQuery.data ?? []) {
    if (item.teacher) {
      const list = classesByTeacher.get(item.teacher._id) ?? [];
      list.push(item);
      classesByTeacher.set(item.teacher._id, list);
    }
  }

  const teachers = teachersQuery.data?.filter(
    (teacher) =>
      matchesSearch(teacher.name, busca) || matchesSearch(teacher.email, busca),
  );

  const [teacherToDeactivate, setTeacherToDeactivate] = useState<User | null>(
    null,
  );
  const reactivate = useUpdateUser();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<User | null>(null);

  function openEdit(teacher: User) {
    setTeacherToEdit(teacher);
    setEditOpen(true);
  }

  function handleToggleActive(teacher: User) {
    if (teacher.active) {
      setTeacherToDeactivate(teacher);
    } else {
      reactivate.mutate({ user: teacher, body: { active: true } });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GraduationCapIcon className="text-primary size-8" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Professores
            </h1>
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Gestão da equipe
            </p>
          </div>
        </div>

        <Button
          className="bg-brand-gradient"
          onClick={() => setCreateOpen(true)}
        >
          <PlusIcon />
          Novo professor
        </Button>
      </div>

      <div className="border-border/40 bg-card/60 flex flex-col gap-3 rounded-2xl border p-3 backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={busca}
            onChange={(event) =>
              void setFilters({ busca: event.target.value, pagina: 1 })
            }
            placeholder="Buscar professor pelo nome ou e-mail…"
            aria-label="Buscar professor"
            className="pl-9"
          />
        </div>

        <SegmentedFilter
          label="Filtrar professores por status"
          options={statusOptions}
          value={status}
          onChange={(next) => void setFilters({ status: next, pagina: 1 })}
        />
      </div>

      {reactivate.isError && (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-3">
          <p className="text-sm">
            Não foi possível reativar {reactivate.variables?.user.name}:{" "}
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

      {teachersQuery.isError ? (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
          <p className="text-sm">{teachersQuery.error.message}</p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => void teachersQuery.refetch()}
          >
            Tentar de novo
          </Button>
        </div>
      ) : !teachers ? (
        <div className="border-border/40 bg-card/60 divide-border/40 flex flex-col divide-y rounded-2xl border">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="px-4 py-3">
              <Skeleton className="h-10 rounded-lg" />
            </div>
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-muted-foreground border-border/40 flex flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center text-sm">
          <SearchXIcon className="size-6" />
          {busca.trim()
            ? `Nenhum professor encontrado para "${busca.trim()}".`
            : status === "ativos"
              ? "Nenhum professor ativo ainda."
              : "Nenhum professor desativado."}
        </div>
      ) : (
        <TeacherList
          teachers={teachers}
          page={pagina}
          classesByTeacher={classesByTeacher}
          onPageChange={(value) => void setFilters({ pagina: value })}
          renderActions={(teacher) => {
            const busy =
              reactivate.isPending &&
              reactivate.variables?.user._id === teacher._id;

            return (
              <>
                {teacher.active && (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Editar ${teacher.name}`}
                    title="Editar"
                    onClick={() => openEdit(teacher)}
                  >
                    <PencilIcon />
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={
                    teacher.active
                      ? `Desativar ${teacher.name}`
                      : `Reativar ${teacher.name}`
                  }
                  title={teacher.active ? "Desativar" : "Reativar"}
                  className={
                    teacher.active
                      ? "hover:text-destructive"
                      : "hover:text-brand-done"
                  }
                  disabled={busy}
                  onClick={() => handleToggleActive(teacher)}
                >
                  {busy ? (
                    <Loader2Icon className="animate-spin" />
                  ) : teacher.active ? (
                    <Trash2Icon />
                  ) : (
                    <RotateCcwIcon />
                  )}
                </Button>
              </>
            );
          }}
        />
      )}

      <CreateTeacherDialog
        open={createOpen}
        classes={classesQuery.data ?? []}
        onClose={() => setCreateOpen(false)}
      />

      <EditTeacherDialog
        open={editOpen}
        teacher={teacherToEdit}
        classes={classesQuery.data ?? []}
        onClose={() => setEditOpen(false)}
      />

      <DeactivateTeacherDialog
        teacher={teacherToDeactivate}
        classes={
          teacherToDeactivate
            ? (classesByTeacher.get(teacherToDeactivate._id) ?? [])
            : []
        }
        onClose={() => setTeacherToDeactivate(null)}
      />
    </div>
  );
}

type TeacherListProps = {
  teachers: User[];
  page: number;
  classesByTeacher: Map<string, ClassSummary[]>;
  onPageChange: (page: number) => void;
  renderActions: (teacher: User) => ReactNode;
};

function TeacherList({
  teachers,
  page,
  classesByTeacher,
  onPageChange,
  renderActions,
}: TeacherListProps) {
  const current = paginate(teachers, page, PAGE_SIZE);

  return (
    <>
      <ul className="border-border/40 bg-card/60 divide-border/40 divide-y rounded-2xl border backdrop-blur-sm">
        {current.docs.map((teacher) => (
          <TeacherRow
            key={teacher._id}
            teacher={teacher}
            classes={classesByTeacher.get(teacher._id) ?? []}
            actions={renderActions(teacher)}
          />
        ))}
      </ul>

      <PaginationControls page={current} onChange={onPageChange} />
    </>
  );
}
