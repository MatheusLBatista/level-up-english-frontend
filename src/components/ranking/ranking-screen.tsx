"use client";

import { TrophyIcon, UsersRoundIcon } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { RankingRow } from "@/components/ranking/ranking-row";
import { RankingScopeFilter } from "@/components/ranking/ranking-scope-filter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useRanking } from "@/hooks/use-ranking";
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

  const rankingQuery = useRanking(escopo);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3">
          <TrophyIcon className="text-brand-level size-8" />
          <h1 className="text-3xl font-extrabold tracking-tight">
            {escopo === "global" ? "Ranking Global" : "Ranking da Turma"}
          </h1>
        </div>

        <p className="text-muted-foreground mt-1 text-sm">
          {rankingQuery.data
            ? `${rankingQuery.data.class ? `${rankingQuery.data.class.name} · ` : ""}Atualizado em ${updatedAtFormatter.format(new Date(rankingQuery.data.updatedAt))}`
            : "Carregando…"}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Lista Completa</h2>
        <RankingScopeFilter value={escopo} onChange={setEscopo} />
      </div>

      {rankingQuery.isPending ? (
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
      ) : rankingQuery.data.entries.length === 0 ? (
        <div className="border-border/40 bg-card/40 flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
          <UsersRoundIcon className="text-muted-foreground size-7" />
          <p className="text-sm font-medium">
            {escopo === "class"
              ? "Sua turma ainda não pontuou."
              : "Ninguém pontuou ainda. Conclua uma missão para abrir o ranking!"}
          </p>
        </div>
      ) : (
        <ol className="border-border/40 bg-card/60 flex flex-col gap-1 rounded-2xl border p-2 backdrop-blur-sm">
          {rankingQuery.data.entries.map((entry, index) => (
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
