"use client";

import { SearchIcon, UserPlusIcon, UsersRoundIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { CreateStudentDialog } from "@/components/shared/create-student-dialog";
import { StudentProfileSheet } from "@/components/shared/student-profile-sheet";
import { StudentCard } from "@/components/teacher/student-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useClassStudents } from "@/hooks/use-class-students";
import { SelectAllCard } from "@/components/teacher/select-all-card";
import { SelectionBar } from "@/components/teacher/selection-bar";
import { ApplyAttitudesDialog } from "@/components/teacher/apply-attitudes-dialog";
import { AdjustXpDialog } from "@/components/teacher/adjust-xp-dialog";
import { ClassSelect } from "@/components/shared/class-select";
import { useSelectedClass } from "@/hooks/use-selected-class";
import { matchesSearch } from "@/lib/text";

export function TeacherPanel() {
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState<
    "attitudes" | "xp" | "student" | null
  >(null);

  const { classesQuery, classes, classId, setClassId } = useSelectedClass();

  const studentsQuery = useClassStudents(classId);

  const students = useMemo(() => {
    const list = studentsQuery.data ?? [];

    return list.filter((student) => matchesSearch(student.name, search));
  }, [studentsQuery.data, search]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const profileStudent =
    (studentsQuery.data ?? []).find((student) => student._id === profileId) ??
    null;

  const className = classes.find((item) => item._id === classId)?.name ?? null;

  const selectedStudents = useMemo(
    () =>
      (studentsQuery.data ?? []).filter((student) =>
        selectedIds.has(student._id),
      ),
    [studentsQuery.data, selectedIds],
  );

  const allVisibleSelected =
    students.length > 0 &&
    students.every((student) => selectedIds.has(student._id));

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

  function openProfile(id: string) {
    setProfileId(id);
    setProfileOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-heading text-title font-semibold">
              Painel de Controle
            </h1>
            <p className="text-muted-foreground text-body">Gerenciar alunos</p>
          </div>
        </div>

        <Button
          disabled={classes.length === 0}
          onClick={() => setOpenDialog("student")}
        >
          <UserPlusIcon />
          Novo aluno
        </Button>
      </div>

      <div className="flex gap-2 sm:gap-3">
        <div className="relative min-w-0 flex-1">
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

        <ClassSelect
          className="w-40 shrink-0 sm:w-56"
          classes={classes}
          value={classId}
          isPending={classesQuery.isPending}
          onChange={(value) => {
            clearSelection();
            void setClassId(value);
          }}
        />
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
              void (classesQuery.isError
                ? classesQuery.refetch()
                : studentsQuery.refetch())
            }
          >
            Tentar de novo
          </Button>
        </div>
      ) : classesQuery.isPending || (classId && studentsQuery.isPending) ? (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-16 rounded-xl sm:h-44 sm:rounded-2xl"
            />
          ))}
        </ul>
      ) : students.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
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
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
          <SelectAllCard
            selectedCount={
              students.filter((student) => selectedIds.has(student._id)).length
            }
            total={students.length}
            onToggle={toggleAllVisible}
          />
          {students.map((student) => (
            <StudentCard
              key={student._id}
              student={student}
              selected={selectedIds.has(student._id)}
              onToggle={toggleStudent}
              onOpenProfile={openProfile}
            />
          ))}
        </ul>
      )}

      {Boolean(studentsQuery.data?.length) && (
        <SelectionBar
          count={selectedStudents.length}
          onClear={clearSelection}
          onApplyAttitude={() => setOpenDialog("attitudes")}
          onAdjustXp={() => setOpenDialog("xp")}
        />
      )}

      <ApplyAttitudesDialog
        open={openDialog === "attitudes"}
        onOpenChange={(open) => setOpenDialog(open ? "attitudes" : null)}
        students={selectedStudents}
        onFinished={clearSelection}
      />

      <CreateStudentDialog
        open={openDialog === "student"}
        classes={classes}
        defaultClassId={classId}
        allowNoClass={false}
        onClose={() => setOpenDialog(null)}
      />

      <AdjustXpDialog
        open={openDialog === "xp"}
        onOpenChange={(open) => setOpenDialog(open ? "xp" : null)}
        students={selectedStudents}
        onFinished={clearSelection}
      />

      <StudentProfileSheet
        open={profileOpen}
        student={profileStudent}
        classLabel={className}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}
