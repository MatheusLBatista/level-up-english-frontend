"use client";

import Link from "next/link";
import { useState } from "react";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { XpHistoryList } from "@/components/shared/xp-history-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useXpHistory } from "@/hooks/use-xp-history";

const PAGE_SIZE = 5;

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

      <Card className="border-border bg-card">
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
            <div className="text-muted-foreground border-border flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center text-sm">
              Seu XP ainda não mudou. Conclua missões para começar a pontuar.
              <Button asChild size="sm" variant="outline">
                <Link href="/missoes">Ver missões</Link>
              </Button>
            </div>
          ) : (
            <>
              <XpHistoryList
                items={current.docs}
                dimmed={historyQuery.isPlaceholderData}
              />
              <PaginationControls page={current} onChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
