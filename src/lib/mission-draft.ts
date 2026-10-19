import type { QuizAnswer } from "@/lib/types";

export type MissionDraft = {
  answers: (QuizAnswer | null)[];
  question: number;
};

function draftKey(userId: string, missionId: string) {
  return `levelup-english:mission-draft:${userId}:${missionId}`;
}

export function readMissionDraft(
  userId: string,
  missionId: string,
): MissionDraft | null {
  try {
    const raw = window.localStorage.getItem(draftKey(userId, missionId));
    if (!raw) {
      return null;
    }

    const draft = JSON.parse(raw) as MissionDraft;
    return Array.isArray(draft.answers) ? draft : null;
  } catch {
    return null;
  }
}

export function hasMissionDraft(userId: string, missionId: string) {
  return readMissionDraft(userId, missionId)?.answers.some(Boolean) ?? false;
}

export function saveMissionDraft(
  userId: string,
  missionId: string,
  draft: MissionDraft,
) {
  try {
    window.localStorage.setItem(
      draftKey(userId, missionId),
      JSON.stringify(draft),
    );
  } catch {
    return;
  }
}

export function clearMissionDraft(userId: string, missionId: string) {
  try {
    window.localStorage.removeItem(draftKey(userId, missionId));
  } catch {
    return;
  }
}
