"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentAttitudeLogs } from "@/hooks/use-attitude-logs";
import { formatXpDelta } from "@/lib/attitudes";
import { formatFullDate, formatRelativeTime } from "@/lib/date";
import type { AttitudeLog, User } from "@/lib/types";
import { getInitials } from "@/lib/user";
import { cn } from "@/lib/utils";

const numberFormatter = new Intl.NumberFormat("pt-BR");

const sinceFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

type StudentProfileSheetProps = {
  open: boolean;
  student: User | null;
  classLabel: string | null;
  onClose: () => void;
};

export function StudentProfileSheet({
  open,
  student,
  classLabel,
  onClose,
}: StudentProfileSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {student && (
          <ProfileContent student={student} classLabel={classLabel} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ProfileContent({
  student,
  classLabel,
}: {
  student: User;
  classLabel: string | null;
}) {
  const completed = student.mission_progress.filter((entry) => entry.done);
  const missionXp = completed.reduce(
    (total, entry) => total + entry.xp_earned,
    0,
  );
  const { progress } = student;

  return (
    <>
      <SheetHeader className="border-border/40 border-b pb-5">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback className="bg-brand-gradient font-semibold text-white">
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <span className="truncate">{student.name}</span>
              {!student.active && (
                <Badge
                  variant="outline"
                  className="border-destructive/40 text-destructive text-[10px] tracking-wider uppercase"
                >
                  Inativo
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription className="truncate">
              {student.email}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="flex flex-col gap-6 p-4">
        <section aria-label="Progresso" className="flex flex-col gap-2">
          <div className="flex items-end justify-between gap-3">
            <span className="text-brand-level text-2xl font-extrabold">
              Nível {student.level}
            </span>
            <span className="text-brand-xp font-semibold tabular-nums">
              {numberFormatter.format(student.xp)} XP
            </span>
          </div>
          <Progress value={progress?.percentage ?? 0} className="h-2" />
          <p className="text-muted-foreground text-xs">
            {progress?.next_level_xp === null
              ? "Chegou ao nível máximo."
              : `Faltam ${numberFormatter.format(progress?.xp_to_next_level ?? 0)} XP para o nível ${student.level + 1}.`}
          </p>
        </section>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground text-xs">Turma</dt>
            <dd
              className={cn(
                "font-medium",
                !student.class && "text-brand-level",
              )}
            >
              {student.class ? (classLabel ?? "…") : "Sem turma"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">
              Na plataforma desde
            </dt>
            <dd className="font-medium">
              {student.createdAt
                ? sinceFormatter.format(new Date(student.createdAt))
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">
              Missões concluídas
            </dt>
            <dd className="font-medium tabular-nums">{completed.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs">
              XP vindo de missões
            </dt>
            <dd className="font-medium tabular-nums">
              {numberFormatter.format(missionXp)} XP
            </dd>
          </div>
        </dl>

        <RecentAttitudes studentId={student._id} />
      </div>
    </>
  );
}

function RecentAttitudes({ studentId }: { studentId: string }) {
  const logsQuery = useStudentAttitudeLogs(studentId);

  return (
    <section aria-labelledby="recent-attitudes" className="flex flex-col gap-3">
      <h3
        id="recent-attitudes"
        className="flex items-baseline justify-between text-sm font-semibold"
      >
        Últimas atitudes
        {logsQuery.data && logsQuery.data.totalDocs > 0 && (
          <span className="text-muted-foreground text-xs font-normal tabular-nums">
            {logsQuery.data.totalDocs} no total
          </span>
        )}
      </h3>

      {logsQuery.isError ? (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-3">
          <p className="text-sm">Não foi possível carregar as atitudes.</p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => void logsQuery.refetch()}
          >
            Tentar de novo
          </Button>
        </div>
      ) : !logsQuery.data ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-10 rounded-lg" />
          ))}
        </div>
      ) : logsQuery.data.docs.length === 0 ? (
        <p className="text-muted-foreground border-border/40 rounded-xl border border-dashed p-4 text-center text-xs">
          Nenhuma atitude aplicada a este aluno ainda.
        </p>
      ) : (
        <ul className="divide-border/40 divide-y">
          {logsQuery.data.docs.map((log) => (
            <AttitudeItem key={log._id} log={log} />
          ))}
        </ul>
      )}
    </section>
  );
}

function AttitudeItem({ log }: { log: AttitudeLog }) {
  const xp = log.xp_applied;
  const isNegative = log.attitude ? log.attitude.type === "negative" : xp < 0;

  return (
    <li className="flex items-baseline justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {log.attitude?.name ?? "Atitude removida"}
        </p>
        <p className="text-muted-foreground text-xs">
          {log.teacher?.name ?? "Professor removido"} ·{" "}
          <time
            dateTime={log.applied_at}
            title={formatFullDate(log.applied_at)}
          >
            {formatRelativeTime(log.applied_at)}
          </time>
        </p>
      </div>
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
    </li>
  );
}
