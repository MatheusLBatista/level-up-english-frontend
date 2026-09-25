"use client";

import { SearchIcon, UsersRoundIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { StudentCard } from "@/components/teacher/student-card";
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
import { useClassStudents } from "@/hooks/use-class-students";
import { useTeacherClasses } from "@/hooks/use-teacher-classes";
import { SelectAllCard } from "@/components/teacher/select-all-card";
import { SelectionBar } from "@/components/teacher/selection-bar";

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function TeacherPanel() {
  const [turma, setTurma] = useQueryState("turma");
  const [search, setSearch] = useState("");

  const classesQuery = useTeacherClasses();
  const classes = classesQuery.data ?? [];

  const classId = classes.some((item) => item._id === turma)
    ? turma
    : (classes[0]?._id ?? null);

  const studentsQuery = useClassStudents(classId);

  const students = useMemo(() => {
    const term = normalize(search.trim());
    const list = studentsQuery.data ?? [];

    return term ? list.filter((student) => normalize(student.name).includes(term)) : list;
  }, [studentsQuery.data, search]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  // Só conta quem está na turma carregada; ids de outra turma são ignorados.
  const selectedStudents = useMemo(
    () => (studentsQuery.data ?? []).filter((student) => selectedIds.has(student._id)),
    [studentsQuery.data, selectedIds],
  );

  const allVisibleSelected =
    students.length > 0 && students.every((student) => selectedIds.has(student._id));

  function toggleStudent(id: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      for (const student of students) {
        if (allVisibleSelected) {
          next.delete(student._id);
        } else {
          next.add(student._id);
        }
      }

      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  return (
    <div className="flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="bg-brand-gradient grid size-12 place-items-center rounded-2xl">
          <UsersRoundIcon className="size-6 text-white" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Painel de Controle</h1>
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Gerenciar alunos
          </p>
        </div>
      </div>

      <div className="border-border/40 bg-card/60 flex flex-col gap-3 rounded-2xl border p-3 backdrop-blur-sm sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar aluno…"
            aria-label="Pesquisar aluno"
            className="pl-9"
          />
        </div>

        <Select
          value={classId ?? undefined}
          onValueChange={(value) => void setTurma(value)}
          disabled={classes.length === 0}
        >
          <SelectTrigger className="w-full sm:w-56" aria-label="Turma">
            <SelectValue placeholder={classesQuery.isPending ? "Carregando…" : "Sem turmas"} />
          </SelectTrigger>
          <SelectContent>
            {classes.map((item) => (
              <SelectItem key={item._id} value={item._id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {classesQuery.isError || studentsQuery.isError ? (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
          <p className="text-sm">
            {(classesQuery.error ?? studentsQuery.error)?.message}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() =>
              void (classesQuery.isError ? classesQuery.refetch() : studentsQuery.refetch())
            }
          >
            Tentar de novo
          </Button>
        </div>
      ) : classesQuery.isPending || (classId && studentsQuery.isPending) ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-2xl" />
          ))}
        </ul>
      ) : students.length === 0 ? (
        <div className="border-border/40 bg-card/40 flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
          <UsersRoundIcon className="text-muted-foreground size-7" />
          <p className="text-sm font-medium">
            {!classId
              ? "Você ainda não tem turmas."
              : search
                ? `Nenhum aluno encontrado para “${search}”.`
                : "Esta turma ainda não tem alunos."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <SelectAllCard allSelected={allVisibleSelected} onToggle={toggleAllVisible} />
          {students.map((student) => (
            <StudentCard
              key={student._id}
              student={student}
              selected={selectedIds.has(student._id)}
              onToggle={toggleStudent}
            />
          ))}
        </ul>
      )}

      {Boolean(studentsQuery.data?.length) && (
        <SelectionBar count={selectedStudents.length} onClear={clearSelection} />
      )}
    </div>
  );
}
