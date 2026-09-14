import { ListChecksIcon, TargetIcon, Volume2Icon, ZapIcon } from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Mission, MissionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const missionStyles: Record<
  MissionType,
  { icon: ComponentType<LucideProps>; label: string; tile: string }
> = {
  vocabulary: {
    icon: TargetIcon,
    label: "Vocabulário",
    tile: "from-brand-mission to-brand-reward",
  },
  audio: {
    icon: Volume2Icon,
    label: "Áudio",
    tile: "from-brand-reward to-brand-level",
  },
  quiz: {
    icon: ListChecksIcon,
    label: "Quiz",
    tile: "from-primary to-brand-mission",
  },
};

type MissionCardProps = {
  mission: Mission;
  inProgress: boolean;
};

export function MissionCard({ mission, inProgress }: MissionCardProps) {
  const { icon: Icon, label, tile } = missionStyles[mission.type];

  return (
    <Card className="border-border/40 bg-card/60 hover:border-primary/40 h-full gap-4 backdrop-blur-sm transition-colors">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-2xl bg-linear-to-br",
              tile,
            )}
          >
            <Icon className="size-5 text-white" />
          </span>

          {inProgress && (
            <Badge
              variant="outline"
              className="border-brand-level/40 text-brand-level"
            >
              Em andamento
            </Badge>
          )}
        </div>

        <div>
          <h3 className="leading-tight font-semibold">{mission.title}</h3>
          {mission.description && (
            <p className="text-muted-foreground mt-1 text-sm">
              {mission.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <span className="text-brand-xp inline-flex items-center gap-1 text-sm font-semibold tabular-nums">
            <ZapIcon className="size-4" />
            {mission.xp_reward} XP
          </span>

          <Badge variant="outline" className="text-muted-foreground ml-auto">
            {label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
