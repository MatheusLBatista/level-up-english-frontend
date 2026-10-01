import { Gamepad2Icon, LayoutGridIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassSummary } from "@/lib/types";

type TeacherClassesCardProps = {
  classes?: ClassSummary[];
  isError: boolean;
  onRetry: () => void;
};

export function TeacherClassesCard({
  classes,
  isError,
  onRetry,
}: TeacherClassesCardProps) {
  const largest = Math.max(
    1,
    ...(classes ?? []).map((item) => item.students.length),
  );

  return (
    <Card className="border-border/40 bg-card/60 h-full backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-baseline justify-between gap-2 text-base">
          Suas turmas
          {classes && classes.length > 0 && (
            <span className="text-muted-foreground text-xs font-normal tabular-nums">
              {classes.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isError ? (
          <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-3">
            <p className="text-sm">Não foi possível carregar suas turmas.</p>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={onRetry}
            >
              Tentar de novo
            </Button>
          </div>
        ) : !classes ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        ) : classes.length === 0 ? (
          <p className="text-muted-foreground border-border/40 rounded-xl border border-dashed p-6 text-center text-sm">
            Nenhuma turma por aqui ainda.
          </p>
        ) : (
          <ul className="divide-border/40 -my-3 divide-y">
            {classes.map((item) => {
              const studentCount = item.students.length;
              const missionCount = item.missions.length;

              return (
                <li key={item._id} className="flex flex-col gap-2 py-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{item.name}</p>
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {studentCount} {studentCount === 1 ? "aluno" : "alunos"}{" "}
                        · {missionCount}{" "}
                        {missionCount === 1 ? "missão" : "missões"}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          href={{
                            pathname: "/painel",
                            query: { turma: item._id },
                          }}
                        >
                          <LayoutGridIcon />
                          Painel
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          href={{
                            pathname: "/missoes",
                            query: { turma: item._id },
                          }}
                        >
                          <Gamepad2Icon />
                          Missões
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <Progress
                    value={(studentCount / largest) * 100}
                    aria-label={`${studentCount} alunos em ${item.name}`}
                    className="h-1"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
