"use client";

import {
  CircleCheckIcon,
  Gamepad2Icon,
  SparklesIcon,
  TrophyIcon,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMissions } from "@/hooks/use-mission";

export function DashboardStats() {
  const userQuery = useCurrentUser();
  const missionsQuery = useMissions();

  if (userQuery.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  if (userQuery.isError) {
    return (
      <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
        <p className="text-sm">{userQuery.error.message}</p>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() => userQuery.refetch()}
        >
          Tentar de novo
        </Button>
      </div>
    );
  }

  const user = userQuery.data;
  const doneIds = new Set(
    user.mission_progress.filter((entry) => entry.done).map((e) => e.mission_id),
  );
  const activeMissions = missionsQuery.data?.docs.filter(
    (mission) => !doneIds.has(mission._id),
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={TrophyIcon}
        label="Total XP"
        value={user.xp}
        accentClassName="text-brand-xp"
      />

      <StatCard
        icon={SparklesIcon}
        label={
          user.progress.next_level_xp === null
            ? "Nível máximo"
            : `${user.progress.xp_to_next_level} XP para o nível ${user.level + 1}`
        }
        value={`Nível ${user.level}`}
        accentClassName="text-brand-level"
      >
        <Progress value={user.progress.porcentage} className="h-2" />
      </StatCard>

      <StatCard
        icon={Gamepad2Icon}
        label="Missões ativas"
        value={activeMissions ?? "—"}
        accentClassName="text-brand-mission"
      />

      <StatCard
        icon={CircleCheckIcon}
        label="Completas"
        value={doneIds.size}
        accentClassName="text-brand-done"
      />
    </div>
  );
}
