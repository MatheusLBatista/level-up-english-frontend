"use client";

import { SearchIcon, SearchXIcon, UsersRoundIcon } from "lucide-react";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { StudentRow } from "@/components/admin/students/student-row";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminClasses } from "@/hooks/use-admin-classes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useStudents } from "@/hooks/use-students";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;
const ALL_CLASSES = "todas";

const studentStatuses = ["ativos", "inativos", "todos"] as const;

const statusOptions = [
  { value: "ativos", label: "Ativos" },
  { value: "inativos", label: "Inativos" },
  { value: "todos", label: "Todos" },
] as const;

const activeByStatus = { ativos: true, inativos: false, todos: null } as const;

export function StudentsScreen() {
  const [{ busca, turma, status, pagina }, setFilters] = useQueryStates({
    busca: parseAsString.withDefault(""),
    turma: parseAsString,
    status: parseAsStringLiteral(studentStatuses).withDefault("ativos"),
    pagina: parseAsInteger.withDefault(1),
  });

  const search = useDebouncedValue(busca.trim(), 300);

  const classesQuery = useAdminClasses("todas");
  const classNames = new Map(
    (classesQuery.data ?? []).map((item) => [item._id, item.name]),
  );

  const studentsQuery = useStudents({
    page: pagina,
    limit: PAGE_SIZE,
    name: search,
    classId: turma,
    active: activeByStatus[status],
  });

  const page = studentsQuery.data;
  const hasFilters = Boolean(search || turma);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <UsersRoundIcon className="text-primary size-8" />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Alunos</h1>
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              {page
                ? `${page.totalDocs} ${page.totalDocs === 1 ? "aluno" : "alunos"}`
                : "Gestão de alunos"}
            </p>
          </div>
        </div>
      </div>

      <div className="border-border/40 bg-card/60 flex flex-col gap-3 rounded-2xl border p-3 backdrop-blur-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={busca}
            onChange={(event) =>
              void setFilters({ busca: event.target.value, pagina: 1 })
            }
            placeholder="Buscar aluno pelo nome…"
            aria-label="Buscar aluno"
            className="pl-9"
          />
        </div>

        <Select
          value={turma ?? ALL_CLASSES}
          onValueChange={(value) =>
            void setFilters({
              turma: value === ALL_CLASSES ? null : value,
              pagina: 1,
            })
          }
        >
          <SelectTrigger className="w-full lg:w-52" aria-label="Filtrar por turma">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CLASSES}>Todas as turmas</SelectItem>
            {(classesQuery.data ?? []).map((item) => (
              <SelectItem key={item._id} value={item._id}>
                {item.name}
                {!item.active && " (inativa)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <SegmentedFilter
          label="Filtrar alunos por status"
          options={statusOptions}
          value={status}
          onChange={(next) => void setFilters({ status: next, pagina: 1 })}
        />
      </div>

      {studentsQuery.isError ? (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
          <p className="text-sm">{studentsQuery.error.message}</p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => void studentsQuery.refetch()}
          >
            Tentar de novo
          </Button>
        </div>
      ) : !page ? (
        <div className="border-border/40 bg-card/60 divide-border/40 flex flex-col divide-y rounded-2xl border">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="px-4 py-3">
              <Skeleton className="h-10 rounded-lg" />
            </div>
          ))}
        </div>
      ) : page.docs.length === 0 ? (
        <div className="text-muted-foreground border-border/40 flex flex-col items-center gap-2 rounded-2xl border border-dashed p-10 text-center text-sm">
          <SearchXIcon className="size-6" />
          {hasFilters
            ? "Nenhum aluno encontrado com esses filtros."
            : "Nenhum aluno por aqui ainda."}
        </div>
      ) : (
        <>
          <ul
            className={cn(
              "border-border/40 bg-card/60 divide-border/40 divide-y rounded-2xl border backdrop-blur-sm transition-opacity",
              studentsQuery.isPlaceholderData && "opacity-60",
            )}
          >
            {page.docs.map((student) => (
              <StudentRow
                key={student._id}
                student={student}
                classLabel={student.class ? classNames.get(student.class) : null}
              />
            ))}
          </ul>

          <PaginationControls
            page={page}
            onChange={(value) => void setFilters({ pagina: value })}
          />
        </>
      )}
    </div>
  );
}
