import {
  CrownIcon,
  FlagIcon,
  LockIcon,
  StarIcon,
  TargetIcon,
  TrophyIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAchievements,
  type Achievement,
  type AchievementId,
} from "@/lib/achievements";
import { countCompleted } from "@/lib/missions";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

const icons: Record<AchievementId, LucideIcon> = {
  "first-mission": FlagIcon,
  "missions-5": TargetIcon,
  "missions-10": TrophyIcon,
  "perfect-1": StarIcon,
  "perfect-5": CrownIcon,
  "mission-xp-500": ZapIcon,
};

export function ProfileBadges({ user }: { user: User }) {
  const completed = countCompleted(user);
  const achievements = getAchievements(user);
  const unlocked = achievements.filter((item) => item.unlocked).length;

  return (
    <Card className="border-border bg-card h-full">
      <CardHeader>
        <CardTitle className="flex items-baseline justify-between gap-2 text-base">
          Conquistas
          <span className="text-muted-foreground text-xs font-normal tabular-nums">
            {unlocked} de {achievements.length}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6">
        <div>
          <p className="text-brand-done text-2xl font-bold tabular-nums">
            {completed}
          </p>
          <p className="text-muted-foreground text-xs font-medium">
            Missões concluídas
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementItem key={achievement.id} achievement={achievement} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function AchievementItem({ achievement }: { achievement: Achievement }) {
  const Icon = achievement.unlocked ? icons[achievement.id] : LockIcon;

  return (
    <li
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center",
        achievement.unlocked
          ? "border-brand-level/40 bg-brand-level/10"
          : "border-border bg-card",
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-full",
          achievement.unlocked
            ? "bg-brand-level/20 text-brand-level"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>

      <p className="text-xs leading-tight font-semibold">
        {achievement.title}
        <span className="sr-only">
          {achievement.unlocked ? " (desbloqueada)" : " (bloqueada)"}
        </span>
      </p>
      <p className="text-muted-foreground text-label leading-tight">
        {achievement.description}
      </p>

      {!achievement.unlocked && (
        <p className="text-muted-foreground text-label font-medium tabular-nums">
          {achievement.current}/{achievement.target}
        </p>
      )}
    </li>
  );
}
