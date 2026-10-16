import type {
  Mission,
  MissionProgressEntry,
  MissionType,
  User,
} from "@/lib/types";

export const missionTypeLabels: Record<MissionType, string> = {
  quiz: "Quiz",
  vocabulary: "Vocabulário",
  audio: "Áudio",
};

export type MissionStatus = "todo" | "in-progress" | "done";

export function getMissionStatus(entry?: MissionProgressEntry): MissionStatus {
  if (!entry) {
    return "todo";
  }

  return entry.done ? "done" : "in-progress";
}

export function indexProgress(user: User): Map<string, MissionProgressEntry> {
  return new Map(
    user.mission_progress.map((entry) => [entry.mission_id, entry]),
  );
}

export function countCompleted(user: User): number {
  return user.mission_progress.filter((entry) => entry.done).length;
}

export function selectRecommended(
  missions: Mission[],
  user: User,
  limit = 3,
): Mission[] {
  const progress = indexProgress(user);

  return sortPendingMissions(
    missions.filter((mission) =>
      isMissionPending(mission, progress.get(mission._id)),
    ),
    progress,
  ).slice(0, limit);
}

/** Refazer só faz sentido onde há o que errar: missões com perguntas. */
export function canRetryMission(
  mission: Mission,
  entry?: MissionProgressEntry,
): boolean {
  const hasQuestions = (mission.questions?.length ?? 0) > 0;

  return hasQuestions && entry?.done === true && entry.score < 100;
}

export function missionXpLeft(
  mission: Mission,
  entry?: MissionProgressEntry,
): number {
  return Math.max(0, mission.xp_reward - (entry?.xp_earned ?? 0));
}

export function isMissionPending(
  mission: Mission,
  entry?: MissionProgressEntry,
): boolean {
  return !entry?.done || canRetryMission(mission, entry);
}

export function sortPendingMissions(
  missions: Mission[],
  progress: Map<string, MissionProgressEntry>,
): Mission[] {
  const rank = (mission: Mission) => {
    const entry = progress.get(mission._id);

    if (entry && !entry.done) {
      return 0;
    }

    return entry ? 2 : 1;
  };

  return [...missions].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      missionXpLeft(b, progress.get(b._id)) -
        missionXpLeft(a, progress.get(a._id)) ||
      Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export type NextMission = {
  mission: Mission;
  kind: "new" | "continue" | "retry";
};

export function selectNextMission(
  missions: Mission[],
  user: User,
): NextMission | null {
  const progress = indexProgress(user);
  const [mission] = sortPendingMissions(
    missions.filter((item) => isMissionPending(item, progress.get(item._id))),
    progress,
  );

  if (!mission) {
    return null;
  }

  const entry = progress.get(mission._id);

  return {
    mission,
    kind: !entry ? "new" : entry.done ? "retry" : "continue",
  };
}
