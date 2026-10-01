import type { ClassSummary } from "@/lib/types";

export type ClassesOverview = {
  classCount: number;
  studentCount: number;
  missionCount: number;
};

export function summarizeClasses(classes: ClassSummary[]): ClassesOverview {
  const students = new Set(classes.flatMap((item) => item.students));
  const missions = new Set(classes.flatMap((item) => item.missions));

  return {
    classCount: classes.length,
    studentCount: students.size,
    missionCount: missions.size,
  };
}
