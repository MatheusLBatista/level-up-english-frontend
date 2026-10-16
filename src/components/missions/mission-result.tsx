"use client";

import { RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { LevelSnapshot } from "@/components/missions/mission-player";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { Mission, MissionProgressResult } from "@/lib/types";

type MissionResultProps = {
  mission: Mission;
  result: MissionProgressResult;
  levelBefore: LevelSnapshot;
  onRetry?: () => void;
};

export function MissionResult({
  mission,
  result,
  levelBefore,
  onRetry,
}: MissionResultProps) {
  const userQuery = useCurrentUser();
  const after = userQuery.data;
  const leveledUp = result.progression?.leveled_up ?? false;
  const level = result.progression?.level ?? after?.level ?? levelBefore.level;
  const afterPercentage =
    after && after.level === level
      ? after.progress.percentage
      : levelBefore.progress.percentage;

  const [width, setWidth] = useState(
    leveledUp ? 0 : levelBefore.progress.percentage,
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(afterPercentage));
    return () => cancelAnimationFrame(frame);
  }, [afterPercentage]);

  const teacher = mission.createdBy?.name;

  return (
    <section className="bg-notebook-page border-border relative flex flex-col gap-6 overflow-hidden rounded-lg border py-8 pr-6 pl-14 sm:pr-10">
      {teacher && (
        <div className="border-stamp text-stamp absolute top-6 right-5 flex -rotate-6 flex-col items-center rounded-md border-2 px-3 py-1 sm:right-8">
          <span className="font-heading text-heading leading-none font-bold">
            Visto
          </span>
          <span className="text-label max-w-28 truncate">{teacher}</span>
        </div>
      )}

      <div className="pr-28">
        <p className="text-muted-foreground text-body">Missão entregue</p>
        <p className="text-display text-brand-xp font-semibold tabular-nums">
          {result.xp_earned > 0 ? `+${result.xp_earned} XP` : "0 XP"}
        </p>
        <p className="mt-1 text-base">
          {result.total_questions
            ? `Você acertou ${result.correct_answers} de ${result.total_questions} (${result.score}%).`
            : "Missão concluída."}
        </p>
      </div>

      {(result.best_score > result.score || result.already_rewarded) && (
        <div className="text-muted-foreground text-body flex flex-col gap-1">
          {result.best_score > result.score && (
            <p>Sua melhor nota nesta missão continua {result.best_score}%.</p>
          )}
          {result.already_rewarded && (
            <p>
              {result.xp_earned > 0
                ? `Você superou sua melhor tentativa, e só a diferença entrou. Total nesta missão: ${result.credited_so_far} de ${mission.xp_reward} XP.`
                : `Nenhum XP novo: sua melhor tentativa já rendeu ${result.credited_so_far} de ${mission.xp_reward} XP.`}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <p
            className={
              leveledUp
                ? "text-brand-level font-heading text-heading font-semibold"
                : "font-semibold"
            }
          >
            {leveledUp ? `Você subiu para o nível ${level}!` : `Nível ${level}`}
          </p>
          {after && after.level === level && (
            <p className="text-muted-foreground text-body tabular-nums">
              {after.progress.next_level_xp === null
                ? "Nível máximo"
                : `${after.progress.xp_to_next_level} XP para o nível ${level + 1}`}
            </p>
          )}
        </div>
        <div
          role="progressbar"
          aria-label={`Progresso no nível ${level}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(afterPercentage)}
          className="bg-muted h-3 overflow-hidden rounded-full"
        >
          <div
            className="bg-brand-xp h-full rounded-full motion-safe:transition-[width] motion-safe:duration-1000 motion-safe:ease-out"
            style={{ width: `${width}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg" className="h-12">
          <Link href="/missoes">Voltar às missões</Link>
        </Button>
        {onRetry && (
          <Button
            size="lg"
            variant="outline"
            className="h-12"
            onClick={onRetry}
          >
            <RotateCcwIcon />
            Tentar de novo
          </Button>
        )}
      </div>
    </section>
  );
}
