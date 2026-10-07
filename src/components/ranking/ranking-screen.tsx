"use client";

import { TrophyIcon, UsersRoundIcon } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { RankingRow } from "@/components/ranking/ranking-row";
import { RankingScopeFilter } from "@/components/ranking/ranking-scope-filter";
import { ClassSelect } from "@/components/teacher/class-select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useRanking } from "@/hooks/use-ranking";
import { useSelectedClass } from "@/hooks/use-selected-class";
import type { RankingScope } from "@/lib/types";

const scopes = ["global", "class"] as const satisfies RankingScope[];

const updatedAtFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function RankingScreen() {
  const { user } = useAuth();
  const [escopo, setEscopo] = useQueryState(
    "escopo",
    parseAsStringLiteral(scopes).withDefault("global"),
  );

  // Aluno vê a própria turma; professor e admin escolhem qual turma ver.
  const isStaff = user !== null && user.role !== "student";
  const { classesQuery, classes, classId, setClassId } =
    useSelectedClass(isStaff);
  const pickingClass = isStaff && escopo === "class";

  const rankingQuery = useRanking(escopo, pickingClass ? classId : undefined);
  const ranking = rankingQuery.data;
  const entries = ranking?.entries ?? [];

  const className =
    ranking?.class?.name ??
    (pickingClass
      ? classes.find((item) => item._id === classId)?.name
      : undefined);
  const subtitle = ranking
    ? `${className ? `${className} · ` : ""}Atualizado em ${updatedAtFormatter.format(new Date(ranking.updatedAt))}`
    : rankingQuery.isSuccess
      ? `${className ? `${className} · ` : ""}Ainda sem pontuação`
      : "Carregando…";

  const noClasses =
    pickingClass && classesQuery.isSuccess && classes.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3">
          <TrophyIcon className="text-brand-level size-8" />
          <h1 className="text-3xl font-extrabold tracking-tight">
            {escopo === "global" ? "Ranking Global" : "Ranking da Turma"}
          </h1>
        </div>

        {!noClasses && (
          <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Lista Completa</h2>
        <div className="flex flex-wrap items-center gap-2">
          {pickingClass && (
            <ClassSelect
              classes={classes}
              value={classId}
              onChange={(value) => void setClassId(value)}
              isPending={classesQuery.isPending}
            />
          )}
          <RankingScopeFilter value={escopo} onChange={setEscopo} />
        </div>
      </div>

      {pickingClass && classesQuery.isError ? (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
          <p className="text-sm">{classesQuery.error.message}</p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => void classesQuery.refetch()}
          >
            Tentar de novo
          </Button>
        </div>
      ) : noClasses ? (
        <div className="border-border/40 bg-card/40 flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
          <UsersRoundIcon className="text-muted-foreground size-7" />
          <p className="text-sm font-medium">
            {user?.role === "teacher"
              ? "Você ainda não é responsável por nenhuma turma."
              : "Nenhuma turma ativa ainda."}
          </p>
        </div>
      ) : rankingQuery.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : rankingQuery.isError ? (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
          <p className="text-sm">{rankingQuery.error.message}</p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => void rankingQuery.refetch()}
          >
            Tentar de novo
          </Button>
        </div>
      ) : entries.length === 0 ? (
        <div className="border-border/40 bg-card/40 flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
          <UsersRoundIcon className="text-muted-foreground size-7" />
          <p className="text-sm font-medium">
            {escopo === "class"
              ? isStaff
                ? "Ninguém desta turma pontuou ainda."
                : "Sua turma ainda não pontuou."
              : isStaff
                ? "Ninguém pontuou ainda."
                : "Ninguém pontuou ainda. Conclua uma missão para abrir o ranking!"}
          </p>
        </div>
      ) : (
        <ol className="border-border/40 bg-card/60 flex flex-col gap-1 rounded-2xl border p-2 backdrop-blur-sm">
          {entries.map((entry, index) => (
            <RankingRow
              key={entry.user._id}
              entry={entry}
              position={index + 1}
              isCurrentUser={entry.user._id === user?._id}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
