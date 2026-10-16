import {
  ListChecksIcon,
  TargetIcon,
  TrophyIcon,
  Volume2Icon,
  ZapIcon,
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMissionStatus } from "@/lib/missions";
import type { Mission, MissionProgressEntry, MissionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const missionStyles: Record<
  MissionType,
  { icon: ComponentType<LucideProps>; label: string; tile: string }
> = {
  vocabulary: {
    icon: TargetIcon,
    label: "Vocabulário",
    tile: "bg-brand-mission/15 text-brand-mission",
  },
  audio: {
    icon: Volume2Icon,
    label: "Áudio",
    tile: "bg-brand-reward/15 text-brand-reward",
  },
  quiz: {
    icon: ListChecksIcon,
    label: "Quiz",
    tile: "bg-brand-level/15 text-brand-level",
  },
};

type MissionCardProps = {
  mission: Mission;
  progress?: MissionProgressEntry;
  action?: ReactNode;
};

export function MissionCard({ mission, progress, action }: MissionCardProps) {
  const { icon: Icon, label, tile } = missionStyles[mission.type];
  const status = getMissionStatus(progress);

  return (
    <Card
      className={cn(
        "border-border bg-card h-full gap-4 transition-colors",
        status === "done" ? "border-brand-done/30" : "hover:border-primary/40",
      )}
    >
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-2xl",
              tile,
            )}
          >
            <Icon className="size-5" />
          </span>

          <Badge variant="outline" className="text-muted-foreground text-label">
            {label}
          </Badge>
        </div>

        <div>
          <h3 className="font-english text-heading leading-tight font-semibold">
            {mission.title}
          </h3>
          {mission.description && (
            <p className="text-muted-foreground mt-1 text-sm">
              {mission.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <span className="border-border text-brand-xp inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm font-semibold tabular-nums">
            <ZapIcon className="size-4" />
            {mission.xp_reward} XP
          </span>

          {status === "done" && (
            <span className="border-border text-brand-level inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm font-semibold tabular-nums">
              <TrophyIcon className="size-4" />
              {progress?.score}
            </span>
          )}

          {status === "in-progress" && (
            <Badge
              variant="outline"
              className="border-brand-level/40 text-brand-level"
            >
              Em andamento
            </Badge>
          )}
        </div>

        {action}
      </CardContent>
    </Card>
  );
}
