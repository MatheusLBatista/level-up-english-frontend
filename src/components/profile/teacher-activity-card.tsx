import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatXpDelta } from "@/lib/attitudes";
import { formatFullDate, formatRelativeTime } from "@/lib/date";
import type { AttitudeLog, Paginated } from "@/lib/types";
import { cn } from "@/lib/utils";

type TeacherActivityCardProps = {
  page?: Paginated<AttitudeLog>;
  isError: boolean;
  onRetry: () => void;
};

export function TeacherActivityCard({
  page,
  isError,
  onRetry,
}: TeacherActivityCardProps) {
  return (
    <Card className="border-border/40 bg-card/60 h-full backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Atividade recente</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {isError ? (
          <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-3">
            <p className="text-sm">Não foi possível carregar a atividade.</p>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={onRetry}
            >
              Tentar de novo
            </Button>
          </div>
        ) : !page ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-9 rounded-lg" />
            ))}
          </div>
        ) : page.docs.length === 0 ? (
          <div className="text-muted-foreground border-border/40 flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center text-sm">
            Você ainda não aplicou atitudes. Elas aparecem aqui depois que você
            usar o Painel.
            <Button asChild size="sm" variant="outline">
              <Link href="/painel">Ir para o Painel</Link>
            </Button>
          </div>
        ) : (
          <>
            <ol className="border-border/60 ml-1.5 border-l">
              {page.docs.map((log) => (
                <ActivityItem key={log._id} log={log} />
              ))}
            </ol>

            {page.totalDocs > page.docs.length && (
              <p className="text-muted-foreground mt-auto text-xs tabular-nums">
                {page.docs.length} mais recentes de {page.totalDocs}.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityItem({ log }: { log: AttitudeLog }) {
  const xp = log.xp_applied;
  const isNegative = log.attitude ? log.attitude.type === "negative" : xp < 0;

  return (
    <li className="relative pb-4 pl-5 last:pb-0">
      <span
        aria-hidden
        className={cn(
          "absolute top-1.5 -left-[5.5px] size-2.5 rounded-full",
          isNegative ? "bg-destructive" : "bg-brand-done",
        )}
      />

      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-sm">
          <span className="font-semibold">
            {log.student?.name ?? "Aluno removido"}
          </span>
          <span className="text-muted-foreground">
            {" "}
            · {log.attitude?.name ?? "Atitude removida"}
          </span>
        </p>

        <span
          className={cn(
            "shrink-0 text-sm font-semibold tabular-nums",
            xp === 0
              ? "text-muted-foreground"
              : isNegative
                ? "text-destructive"
                : "text-brand-done",
          )}
        >
          {formatXpDelta(xp)}
        </span>
      </div>

      <p className="text-muted-foreground text-xs">
        <time dateTime={log.applied_at} title={formatFullDate(log.applied_at)}>
          {formatRelativeTime(log.applied_at)}
        </time>
        {xp === 0 && isNegative && " · saldo já estava em 0"}
      </p>
    </li>
  );
}
