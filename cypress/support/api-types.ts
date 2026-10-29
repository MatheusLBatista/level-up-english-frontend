export type Page<T> = {
  docs: T[];
  totalDocs: number;
  totalPages: number;
};

export type Mission = {
  _id: string;
  title: string;
  description: string;
  type: "quiz" | "vocabulary" | "audio";
  xp_reward: number;
  questions?: { question: string; options: Record<string, string> }[];
};

export type MissionProgress = {
  mission_id: string;
  done: boolean;
  score: number;
  xp_earned: number;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  active: boolean;
  class: string | null;
  xp: number;
  level: number;
  progress: { xp_to_next_level: number; next_level_xp: number | null };
  mission_progress: MissionProgress[];
};

export type XpHistoryItem = {
  kind: "attitude" | "adjustment" | "mission";
  title: string;
  detail: string | null;
  teacher?: string | null;
};

export type Ranking = {
  class: { _id: string; name: string } | null;
  entries: { user: { _id: string; name: string }; xp: number; level: number }[];
};

type MissionType = Mission["type"];

export type Performance = {
  student: Record<MissionType, { score: number | null; missions: number }>;
  class: Record<MissionType, { score: number | null; students: number }> | null;
};

/** O mesmo texto que o radar deixa para leitores de tela, por tipo. */
export function performanceSummary(
  performance: Performance,
  studentLabel: "Você" | "Aluno",
) {
  const labels: Record<MissionType, string> = {
    quiz: "Quiz",
    vocabulary: "Vocabulário",
    audio: "Áudio",
  };
  const format = (score: number | null) =>
    score === null ? "Sem missões concluídas" : `${score}`;

  return (Object.keys(labels) as MissionType[]).map((type) => {
    const own = `${labels[type]}: ${studentLabel} ${format(performance.student[type].score)}`;

    return performance.class
      ? `${own}; média da turma ${format(performance.class[type].score)}`
      : own;
  });
}

export type ClassSummary = {
  _id: string;
  name: string;
  active: boolean;
  teacher: { _id: string; name: string } | null;
  students: string[];
  missions: string[];
};

export type Attitude = {
  _id: string;
  name: string;
  description: string | null;
  active: boolean;
  xp_value: number;
  type: "positive" | "negative";
};

export type AttitudeLog = {
  student: { name: string } | null;
  attitude: { name: string } | null;
};

/** Envelope de resposta da API, para as respostas simuladas. */
export function envelope<T>(data: T) {
  return { message: "ok", errors: [], data };
}

/** Mesma regra de src/lib/missions.ts: sem nota máxima, dá para refazer. */
export function isPending(mission: Mission, entry?: MissionProgress) {
  const canRetry =
    (mission.questions?.length ?? 0) > 0 &&
    entry?.done === true &&
    entry.score < 100;

  return !entry?.done || canRetry;
}
