import type { Mission, MissionProgressEntry, User } from "@/lib/types";

export function indexProgress(user: User): Map<string, MissionProgressEntry> {
  return new Map(user.mission_progress.map((entry) => [entry.mission_id, entry]));
}

export function countCompleted(user: User): number {
  return user.mission_progress.filter((entry) => entry.done).length;
}

export function countActive(missions: Mission[], user: User): number {
  const progress = indexProgress(user);

  return missions.filter((mission) => !progress.get(mission._id)?.done).length;
}

export function selectRecommended(
  missions: Mission[],
  user: User,
  limit = 3,
): Mission[] {
  const progress = indexProgress(user);

  return missions
    .filter((mission) => !progress.get(mission._id)?.done)
    .sort((a, b) => {
      const startedFirst =
        Number(progress.has(b._id)) - Number(progress.has(a._id));

      if (startedFirst !== 0) {
        return startedFirst;
      }

      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    })
    .slice(0, limit);
  }
