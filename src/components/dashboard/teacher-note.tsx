"use client";

import { PenLineIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useClass } from "@/hooks/use-class";
import { useXpHistory } from "@/hooks/use-xp-history";
import { formatFullDate, formatRelativeTime } from "@/lib/date";
import type { XpHistoryItem } from "@/lib/types";
import { cn } from "@/lib/utils";

function teacherOf(item: XpHistoryItem) {
  if (item.kind === "attitude") {
    return item.detail;
  }

  return item.kind === "adjustment" ? (item.teacher ?? null) : null;
}

function formatXp(xp: number) {
  return `${xp > 0 ? "+" : ""}${xp} XP`;
}

export function TeacherNote() {
  const { user } = useAuth();
  const historyQuery = useXpHistory(user?._id, { page: 1, limit: 10 });
  const classQuery = useClass(user?.class);

  const latest = historyQuery.data?.docs.find((item) => teacherOf(item));
  const classTeacher = classQuery.data?.teacher?.name;

  if (historyQuery.isPending) {
    return <Skeleton className="h-16 w-full rounded-md sm:w-72" />;
  }

  if (!latest && !classTeacher) {
    return null;
  }

  return (
    <aside className="border-stamp/40 flex flex-col gap-1 border-t border-dashed pt-4 sm:max-w-80 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
      <p className="text-stamp text-label flex items-center gap-1.5 font-semibold">
        <PenLineIcon className="size-3.5" />
        {latest
          ? `Anotação de ${teacherOf(latest)}`
          : `Turma de ${classTeacher}`}
      </p>

      {latest ? (
        <>
          <p className="text-base">
            <span
              className={cn(
                "font-semibold tabular-nums",
                latest.xp < 0 ? "text-destructive" : "text-brand-done",
              )}
            >
              {formatXp(latest.xp)}
            </span>{" "}
            {latest.kind === "attitude"
              ? `por ${latest.title}`
              : (latest.detail ?? "em ajuste de XP")}
          </p>
          <p className="text-muted-foreground text-body">
            {latest.date && (
              <time dateTime={latest.date} title={formatFullDate(latest.date)}>
                {formatRelativeTime(latest.date)}
              </time>
            )}
            {latest.date && " · "}
            <Link
              href="#historico"
              className="text-foreground underline underline-offset-4"
            >
              Ver histórico
            </Link>
          </p>
        </>
      ) : (
        <p className="text-muted-foreground text-body">
          As missões e as atitudes de aula aparecem aqui quando seu professor
          lançar.
        </p>
      )}
    </aside>
  );
}
