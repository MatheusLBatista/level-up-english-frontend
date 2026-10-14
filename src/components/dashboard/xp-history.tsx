"use client";

import Link from "next/link";
import { useState } from "react";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useXpHistory } from "@/hooks/use-xp-history";
import { formatXpDelta } from "@/lib/attitudes";
import { formatFullDate, formatRelativeTime } from "@/lib/date";
import type { XpHistoryItem, XpHistoryKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

const kindLabels: Record<XpHistoryKind, string> = {
  attitude: "Atitude",
  adjustment: "Ajuste",
  mission: "Missão",
};

export function XpHistory() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const historyQuery = useXpHistory(user?._id, { page, limit: PAGE_SIZE });
  const current = historyQuery.data;

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">Histórico de XP</h2>
        {current && current.totalDocs > 0 && (
          <span className="text-muted-foreground text-sm tabular-nums">
            {current.totalDocs}{" "}
            {current.totalDocs === 1 ? "registro" : "registros"}
          </span>
        )}
      </header>

      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardContent className="flex flex-col gap-4">
          {historyQuery.isError ? (
            <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-3">
              <p className="text-sm">Não foi possível carregar o histórico.</p>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => void historyQuery.refetch()}
              >
                Tentar de novo
              </Button>
            </div>
          ) : !current ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-9 rounded-lg" />
              ))}
            </div>
          ) : current.docs.length === 0 ? (
            <div className="text-muted-foreground border-border/40 flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center text-sm">
              Seu XP ainda não mudou. Conclua missões para começar a pontuar.
              <Button asChild size="sm" variant="outline">
                <Link href="/missoes">Ver missões</Link>
              </Button>
            </div>
          ) : (
            <>
              <ol
                className={cn(
                  "border-border/60 ml-1.5 border-l transition-opacity",
                  historyQuery.isPlaceholderData && "opacity-60",
                )}
              >
                {current.docs.map((item) => (
                  <HistoryItem key={`${item.kind}-${item.id}`} item={item} />
                ))}
              </ol>

              <PaginationControls page={current} onChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function describeItem(item: XpHistoryItem) {
  switch (item.kind) {
    case "attitude":
      return item.detail ? `por ${item.detail}` : null;
    case "adjustment":
      return [item.detail, item.teacher && `por ${item.teacher}`]
        .filter(Boolean)
        .join(" · ");
    case "mission":
      return item.detail;
  }
}

function HistoryItem({ item }: { item: XpHistoryItem }) {
  const description = describeItem(item);

  return (
    <li className="relative pb-4 pl-5 last:pb-0">
      <span
        aria-hidden
        className={cn(
          "absolute top-1.5 -left-[5.5px] size-2.5 rounded-full",
          item.xp < 0
            ? "bg-destructive"
            : item.xp > 0
              ? "bg-brand-done"
              : "bg-muted-foreground",
        )}
      />

      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-semibold">{item.title}</p>

        <span
          className={cn(
            "shrink-0 text-sm font-semibold tabular-nums",
            item.xp < 0
              ? "text-destructive"
              : item.xp > 0
                ? "text-brand-done"
                : "text-muted-foreground",
          )}
        >
          {formatXpDelta(item.xp)}
        </span>
      </div>

      <p className="text-muted-foreground text-xs">
        {kindLabels[item.kind]}
        {description && ` · ${description}`}
        {item.xp === 0 && " · saldo já estava em 0"}
        {item.date && (
          <>
            {" · "}
            <time dateTime={item.date} title={formatFullDate(item.date)}>
              {formatRelativeTime(item.date)}
            </time>
          </>
        )}
      </p>
    </li>
  );
}
