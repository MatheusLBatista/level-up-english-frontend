"use client";

import { CheckCircle2Icon, PlayIcon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { hasMissionDraft } from "@/lib/mission-draft";
import {
  canRetryMission,
  getMissionStatus,
  missionXpLeft,
} from "@/lib/missions";
import type { Mission, MissionProgressEntry } from "@/lib/types";

export function useMissionDraftFlag(missionId: string) {
  const { user } = useAuth();

  return user ? hasMissionDraft(user._id, missionId) : false;
}

export function missionActionLabel(
  mission: Mission,
  progress: MissionProgressEntry | undefined,
  hasDraft: boolean,
) {
  if (hasDraft) {
    return "Continuar";
  }

  if (canRetryMission(mission, progress)) {
    return `Tentar de novo · até +${missionXpLeft(mission, progress)} XP`;
  }

  return getMissionStatus(progress) === "in-progress"
    ? "Continuar"
    : "Jogar agora";
}

export function MissionAction({
  mission,
  progress,
}: {
  mission: Mission;
  progress?: MissionProgressEntry;
}) {
  const hasDraft = useMissionDraftFlag(mission._id);
  const isRetry = !hasDraft && canRetryMission(mission, progress);

  if (progress?.done && !isRetry && !hasDraft) {
    return (
      <p className="bg-brand-done/10 text-brand-done flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium">
        <CheckCircle2Icon className="size-4" />
        Concluído
      </p>
    );
  }

  return (
    <Button
      asChild
      variant={isRetry ? "outline" : "default"}
      className="h-11 w-full"
    >
      <Link href={`/missoes/${mission._id}`}>
        {isRetry ? <RotateCcwIcon /> : <PlayIcon />}
        {missionActionLabel(mission, progress, hasDraft)}
      </Link>
    </Button>
  );
}
