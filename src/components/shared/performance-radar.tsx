"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  type TooltipContentProps,
  type TooltipValueType,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerformance } from "@/hooks/use-performance";
import { missionTypeLabels } from "@/lib/missions";
import type { MissionType, Performance } from "@/lib/types";
import { cn } from "@/lib/utils";

const MISSION_TYPES: MissionType[] = ["quiz", "vocabulary", "audio"];

const NO_MISSIONS = "Sem missões concluídas";

type RadarPoint = {
  label: string;
  /** Desenhado como 0 quando não há nota; o valor real fica em `*Score`. */
  student: number;
  class: number;
  studentScore: number | null;
  classScore: number | null;
};

function toPoints(performance: Performance): RadarPoint[] {
  return MISSION_TYPES.map((type) => {
    const studentScore = performance.student[type].score;
    const classScore = performance.class?.[type].score ?? null;

    return {
      label: missionTypeLabels[type],
      student: studentScore ?? 0,
      class: classScore ?? 0,
      studentScore,
      classScore,
    };
  });
}

function formatScore(score: number | null) {
  return score === null ? NO_MISSIONS : `${score}`;
}

function PerformanceTooltip({
  active,
  payload,
  label,
}: TooltipContentProps<TooltipValueType, string | number>) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload as RadarPoint;

  return (
    <div className="border-border/50 bg-background grid min-w-36 gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      <p className="font-medium">{label}</p>
      {payload.map((item) => {
        const score =
          item.dataKey === "class" ? point.classScore : point.studentScore;

        return (
          <div key={String(item.dataKey)} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span
              className={cn(
                "ml-auto pl-3",
                score === null
                  ? "text-muted-foreground"
                  : "text-foreground font-mono font-medium tabular-nums",
              )}
            >
              {formatScore(score)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

type PerformanceRadarProps = {
  studentId: string | null | undefined;
  isSelf?: boolean;
};

export function PerformanceRadar({
  studentId,
  isSelf = false,
}: PerformanceRadarProps) {
  const performanceQuery = usePerformance(studentId);
  const performance = performanceQuery.data;

  if (performanceQuery.isError) {
    return (
      <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-3">
        <p className="text-sm">Não foi possível carregar o desempenho.</p>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() => void performanceQuery.refetch()}
        >
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (!performance) {
    return <Skeleton className="mx-auto aspect-square w-full max-w-72" />;
  }

  const points = toPoints(performance);

  if (points.every((point) => point.studentScore === null)) {
    return (
      <div className="text-muted-foreground border-border rounded-xl border border-dashed p-6 text-center text-sm">
        {isSelf
          ? "Conclua missões para ver seu desempenho em cada tipo."
          : "O aluno ainda não concluiu nenhuma missão."}
      </div>
    );
  }

  const studentLabel = isSelf ? "Você" : "Aluno";
  const showClass = performance.class !== null;

  const config = {
    student: { label: studentLabel, color: "var(--chart-2)" },
    class: { label: "Média da turma", color: "var(--chart-1)" },
  } satisfies ChartConfig;

  return (
    <figure
      className={cn(
        "transition-opacity",
        performanceQuery.isPlaceholderData && "opacity-60",
      )}
    >
      <ChartContainer
        config={config}
        className="mx-auto aspect-[5/4] max-h-80 w-full"
        aria-hidden
      >
        <RadarChart data={points} cy="56%" outerRadius="78%">
          <ChartTooltip content={PerformanceTooltip} />
          <PolarGrid />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: "var(--foreground)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tickCount={5}
            tick={false}
            axisLine={false}
          />
          <Radar
            dataKey="student"
            name={config.student.label}
            stroke="var(--color-student)"
            fill="var(--color-student)"
            fillOpacity={0.3}
            dot={{ r: 3, fillOpacity: 1 }}
          />
          {/* Por cima e sem preenchimento, para não sumir sob a série do aluno. */}
          {showClass && (
            <Radar
              dataKey="class"
              name={config.class.label}
              stroke="var(--color-class)"
              strokeWidth={2}
              strokeDasharray="5 4"
              fill="none"
              dot={{ r: 2.5, fill: "var(--color-class)", fillOpacity: 1 }}
            />
          )}
          <ChartLegend content={<ChartLegendContent />} itemSorter={null} />
        </RadarChart>
      </ChartContainer>

      <figcaption className="sr-only">
        <ul>
          {points.map((point) => (
            <li key={point.label}>
              {point.label}: {studentLabel} {formatScore(point.studentScore)}
              {showClass && `; média da turma ${formatScore(point.classScore)}`}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
