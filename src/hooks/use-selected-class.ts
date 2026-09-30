"use client";

import { useQueryState } from "nuqs";
import { useTeacherClasses } from "@/hooks/use-teacher-classes";

export function useSelectedClass() {
  const [turma, setTurma] = useQueryState("turma");
  const classesQuery = useTeacherClasses();
  const classes = classesQuery.data ?? [];

  const classId = classes.some((item) => item._id === turma)
    ? turma
    : (classes[0]?._id ?? null);

  return { classesQuery, classes, classId, setClassId: setTurma };
}
