"use client";

import { PerformanceRadar } from "@/components/shared/performance-radar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export function DashboardPerformance() {
  const { user } = useAuth();

  return (
    <section aria-labelledby="desempenho" className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 id="desempenho" className="font-heading text-heading font-semibold">
          Desempenho por tipo de missão
        </h2>
        <p className="text-muted-foreground text-sm">
          Sua nota média em cada tipo, comparada com a média da turma.
        </p>
      </header>

      <Card className="border-border bg-card">
        <CardContent>
          <PerformanceRadar studentId={user?._id} isSelf />
        </CardContent>
      </Card>
    </section>
  );
}
