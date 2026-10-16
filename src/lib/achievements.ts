import type { User } from "@/lib/types";

export type AchievementId =
  | "first-mission"
  | "missions-5"
  | "missions-10"
  | "perfect-1"
  | "perfect-5"
  | "mission-xp-500";

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  current: number;
  target: number;
  unlocked: boolean;
};

type AchievementStats = {
  completed: number;
  perfect: number;
  missionXp: number;
};

type AchievementRule = Omit<Achievement, "current" | "unlocked"> & {
  metric: (stats: AchievementStats) => number;
};

const rules: AchievementRule[] = [
  {
    id: "first-mission",
    title: "Primeiro passo",
    description: "Conclua sua primeira missão.",
    target: 1,
    metric: (stats) => stats.completed,
  },
  {
    id: "missions-5",
    title: "Ritmo",
    description: "Conclua 5 missões.",
    target: 5,
    metric: (stats) => stats.completed,
  },
  {
    id: "missions-10",
    title: "Maratonista",
    description: "Conclua 10 missões.",
    target: 10,
    metric: (stats) => stats.completed,
  },
  {
    id: "perfect-1",
    title: "Nota máxima",
    description: "Acerte 100% de uma missão.",
    target: 1,
    metric: (stats) => stats.perfect,
  },
  {
    id: "perfect-5",
    title: "Perfeccionista",
    description: "Acerte 100% de 5 missões.",
    target: 5,
    metric: (stats) => stats.perfect,
  },
  {
    id: "mission-xp-500",
    title: "Caçador de XP",
    description: "Ganhe 500 XP em missões.",
    target: 500,
    metric: (stats) => stats.missionXp,
  },
];

export function getAchievements(user: User): Achievement[] {
  const done = user.mission_progress.filter((entry) => entry.done);
  const stats: AchievementStats = {
    completed: done.length,
    perfect: done.filter((entry) => entry.score === 100).length,
    missionXp: done.reduce((total, entry) => total + entry.xp_earned, 0),
  };

  return rules.map(({ metric, ...rule }) => {
    const current = Math.min(metric(stats), rule.target);

    return { ...rule, current, unlocked: current >= rule.target };
  });
}
