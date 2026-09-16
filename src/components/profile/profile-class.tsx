"use client";

import { GraduationCapIcon, UsersRoundIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClass } from "@/hooks/use-class";
import { useRanking } from "@/hooks/use-ranking";
import type { User } from "@/lib/types";

export function ProfileClass({ user }: { user: User }) {
  const classQuery = useClass(user.class);
  const rankingQuery = useRanking("class");

  const position = rankingQuery.data
    ? rankingQuery.data.entries.findIndex((entry) => entry.user._id === user._id) + 1
    : 0;

  if (!user.class) {
    return (
      <Card className="border-border/40 bg-card/60 h-full backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Você ainda não está em uma turma. Fale com seu professor.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/60 h-full backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Turma</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-6">
        {classQuery.isPending ? (
          <Skeleton className="h-16 rounded-xl" />
        ) : classQuery.isError ? (
          <p className="text-muted-foreground text-sm">
            Não foi possível carregar os dados da turma.
          </p>
        ) : (
          <>
            <div>
              <p className="text-lg font-semibold">{classQuery.data.name}</p>
              {classQuery.data.teacher && (
                <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <GraduationCapIcon className="size-4" />
                  {classQuery.data.teacher.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {classQuery.data.students.length}
                </p>
                <p className="text-muted-foreground flex items-center gap-1 text-xs font-medium tracking-wider uppercase">
                  <UsersRoundIcon className="size-3.5" />
                  Colegas
                </p>
              </div>

              <div>
                <p className="text-brand-level text-2xl font-bold tabular-nums">
                  {position > 0 ? `${position}º` : "—"}
                </p>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Posição na turma
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
