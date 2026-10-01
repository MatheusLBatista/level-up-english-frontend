import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassesOverview } from "@/lib/teacher";
import { cn } from "@/lib/utils";

const numberFormatter = new Intl.NumberFormat("pt-BR");

function pluralize(count: number, one: string, other: string) {
  return count === 1 ? one : other;
}

type HighlightProps = {
  count: number;
  one: string;
  other: string;
  className: string;
};

function Highlight({ count, one, other, className }: HighlightProps) {
  return (
    <strong className={cn("font-extrabold tabular-nums", className)}>
      {numberFormatter.format(count)} {pluralize(count, one, other)}
    </strong>
  );
}

type TeacherSummaryProps = {
  overview?: ClassesOverview;
  attitudeCount?: number;
  isError: boolean;
  onRetry: () => void;
};

export function TeacherSummary({
  overview,
  attitudeCount,
  isError,
  onRetry,
}: TeacherSummaryProps) {
  if (isError) {
    return (
      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
        Não foi possível carregar seus números.
        <Button size="sm" variant="outline" onClick={onRetry}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (!overview || attitudeCount === undefined) {
    return (
      <div className="flex max-w-3xl flex-col gap-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    );
  }

  if (overview.classCount === 0) {
    return (
      <p className="text-muted-foreground max-w-3xl text-xl leading-snug text-balance sm:text-2xl">
        Você ainda não tem turmas. Assim que uma turma for criada para você,
        seus números aparecem aqui.
      </p>
    );
  }

  const { studentCount, classCount, missionCount } = overview;

  return (
    <p className="max-w-3xl text-2xl leading-snug font-medium text-balance sm:text-3xl">
      Você acompanha{" "}
      <Highlight
        count={studentCount}
        one="aluno"
        other="alunos"
        className="text-brand-xp"
      />{" "}
      em{" "}
      <Highlight
        count={classCount}
        one="turma"
        other="turmas"
        className="text-brand-level"
      />
      , com{" "}
      <Highlight
        count={missionCount}
        one="missão"
        other="missões"
        className="text-brand-mission"
      />{" "}
      {pluralize(missionCount, "cadastrada", "cadastradas")} e{" "}
      <Highlight
        count={attitudeCount}
        one="atitude"
        other="atitudes"
        className="text-brand-done"
      />{" "}
      {pluralize(attitudeCount, "aplicada", "aplicadas")}.
    </p>
  );
}
