"use client";

import { GraduationCapIcon, SearchXIcon } from "lucide-react";
import { parseAsInteger, parseAsStringLiteral, useQueryStates } from "nuqs";
import { TeacherRow } from "@/components/admin/teachers/teacher-row";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminClasses } from "@/hooks/use-admin-classes";
import { useTeachers } from "@/hooks/use-teachers";
import { paginate } from "@/lib/paginate";
import type { ClassSummary } from "@/lib/types";

const PAGE_SIZE = 10;

const teacherStatuses = ["ativos", "desativados"] as const;

const statusOptions = [
  { value: "ativos", label: "Ativos" },
  { value: "desativados", label: "Desativados" },
] as const;

export function TeachersScreen() {
  const [{ status, pagina }, setFilters] = useQueryStates({
    status: parseAsStringLiteral(teacherStatuses).withDefault("ativos"),
    pagina: parseAsInteger.withDefault(1),
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

  const teachers = teachersQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GraduationCapIcon className="text-primary size-8" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Professores</h1>
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Gestão da equipe
            </p>
          </div>
        </div>
      </div>

      <SegmentedFilter
        label="Filtrar professores por status"
        options={statusOptions}
        value={status}
        onChange={(next) => void setFilters({ status: next, pagina: 1 })}
      />

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
          {status === "ativos"
            ? "Nenhum professor ativo ainda."
            : "Nenhum professor desativado."}
        </div>
      ) : (
        <TeacherList
          teachers={teachers}
          page={pagina}
          classesByTeacher={classesByTeacher}
          onPageChange={(value) => void setFilters({ pagina: value })}
        />
      )}
    </div>
  );
}

type TeacherListProps = {
  teachers: NonNullable<ReturnType<typeof useTeachers>["data"]>;
  page: number;
  classesByTeacher: Map<string, ClassSummary[]>;
  onPageChange: (page: number) => void;
};

function TeacherList({
  teachers,
  page,
  classesByTeacher,
  onPageChange,
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
          />
        ))}
      </ul>

      <PaginationControls page={current} onChange={onPageChange} />
    </>
  );
}
