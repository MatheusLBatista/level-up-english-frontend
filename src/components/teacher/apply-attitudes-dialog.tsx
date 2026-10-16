"use client";

import {
  CheckIcon,
  CircleCheckIcon,
  Loader2Icon,
  TriangleAlertIcon,
  Undo2Icon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useApplyAttitudes,
  useUndoAttitudes,
} from "@/hooks/use-apply-attitudes";
import { useAttitudes } from "@/hooks/use-attitudes";
import { formatXpDelta, getAttitudeXp } from "@/lib/attitudes";
import type { Attitude, User } from "@/lib/types";
import { cn } from "@/lib/utils";

function studentsLabel(count: number) {
  return count === 1 ? "1 aluno" : `${count} alunos`;
}

type ApplyAttitudesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: User[];
  onFinished: () => void;
};

export function ApplyAttitudesDialog({
  open,
  onOpenChange,
  students,
  onFinished,
}: ApplyAttitudesDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const attitudesQuery = useAttitudes();
  const mutation = useApplyAttitudes();
  const undo = useUndoAttitudes();

  const attitudes = attitudesQuery.data ?? [];
  const rewards = attitudes.filter((attitude) => getAttitudeXp(attitude) >= 0);
  const penalties = attitudes.filter((attitude) => getAttitudeXp(attitude) < 0);
  const selectedAttitudes = attitudes.filter((attitude) =>
    selectedIds.has(attitude._id),
  );
  const xpPerStudent = selectedAttitudes.reduce(
    (sum, attitude) => sum + getAttitudeXp(attitude),
    0,
  );
  const result = mutation.data;
  const busy = mutation.isPending || undo.isPending;

  function handleOpenChange(next: boolean) {
    if (!next) {
      if (busy) {
        return;
      }

      if (result) {
        onFinished();
      }

      mutation.reset();
      undo.reset();
      setSelectedIds(new Set());
    }

    onOpenChange(next);
  }

  function toggleAttitude(id: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function renderGroup(title: string, items: Attitude[]) {
    if (items.length === 0) {
      return null;
    }

    return (
      <section className="flex flex-col gap-2">
        <h3 className="text-muted-foreground text-label font-semibold">
          {title}
        </h3>
        <ul className="flex flex-col gap-2">
          {items.map((attitude) => {
            const xp = getAttitudeXp(attitude);
            const selected = selectedIds.has(attitude._id);

            return (
              <li key={attitude._id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  disabled={busy}
                  onClick={() => toggleAttitude(attitude._id)}
                  className={cn(
                    "border-border bg-card hover:bg-accent focus-visible:ring-ring/50 flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 text-left transition-colors outline-none focus-visible:ring-[3px] disabled:opacity-60",
                    selected &&
                      "border-primary bg-primary/10 hover:bg-primary/15",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-md border",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input",
                    )}
                  >
                    {selected && <CheckIcon className="size-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold">
                    {attitude.name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      xp >= 0 ? "text-brand-done" : "text-destructive",
                    )}
                  >
                    {formatXpDelta(xp)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-border border-b px-6 pt-6 pr-12 pb-5">
          <DialogTitle>Aplicar atitudes</DialogTitle>
          <DialogDescription>
            Para {studentsLabel(students.length)}. Escolha uma ou mais atitudes.
          </DialogDescription>
          <details className="text-body group mt-1">
            <summary className="text-foreground min-h-11 cursor-pointer content-center font-medium underline underline-offset-4 sm:min-h-0">
              {students.length === 1 ? "Ver aluno" : "Ver quem vai receber"}
            </summary>
            <ul className="text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {students.map((student) => (
                <li key={student._id}>{student.name}</li>
              ))}
            </ul>
          </details>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          {result ? (
            undo.isSuccess ? (
              <div className="border-border bg-card flex flex-col items-center gap-2 rounded-xl border p-8 text-center">
                <Undo2Icon className="text-muted-foreground size-7" />
                <p className="text-lg font-semibold">Atitudes desfeitas</p>
                <p className="text-muted-foreground text-sm">
                  O XP dos alunos voltou ao que era antes.
                </p>
              </div>
            ) : result.failures.length === 0 ? (
              <div className="border-border bg-card flex flex-col items-center gap-2 rounded-xl border p-8 text-center">
                <CircleCheckIcon className="text-brand-done size-7" />
                <p className="text-lg font-semibold">
                  {mutation.variables.attitudes.length === 1
                    ? `${mutation.variables.attitudes[0].name}: aplicada a ${studentsLabel(mutation.variables.students.length)}`
                    : `${mutation.variables.attitudes.length} atitudes aplicadas a ${studentsLabel(mutation.variables.students.length)}`}
                </p>
                <p className="text-muted-foreground text-sm">
                  Cada aluno recebeu{" "}
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      xpPerStudent >= 0
                        ? "text-brand-done"
                        : "text-destructive",
                    )}
                  >
                    {formatXpDelta(xpPerStudent)}
                  </span>
                  . Aplicou errado? Dá para desfazer agora.
                </p>
              </div>
            ) : (
              <div className="border-destructive/40 bg-destructive/10 flex flex-col gap-3 rounded-xl border p-4">
                <p className="flex items-center gap-2 font-semibold">
                  <TriangleAlertIcon className="text-destructive size-5" />
                  {result.applied} de {result.total} aplicadas
                </p>
                <ul className="flex flex-col gap-1 text-sm">
                  {result.failures.map((failure) => (
                    <li key={`${failure.student._id}-${failure.attitude._id}`}>
                      <span className="font-medium">
                        {failure.student.name}
                      </span>{" "}
                      · {failure.attitude.name}:{" "}
                      <span className="text-muted-foreground">
                        {failure.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : attitudesQuery.isPending ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : attitudesQuery.isError ? (
            <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
              <p className="text-sm">{attitudesQuery.error.message}</p>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => void attitudesQuery.refetch()}
              >
                Tentar de novo
              </Button>
            </div>
          ) : attitudes.length === 0 ? (
            <p className="text-muted-foreground border-border rounded-xl border border-dashed p-8 text-center text-sm">
              Nenhuma atitude ativa cadastrada.
            </p>
          ) : (
            <>
              {renderGroup("Prêmios", rewards)}
              {renderGroup("Punições", penalties)}
            </>
          )}

          {mutation.isError && (
            <p
              role="alert"
              className="border-destructive/40 bg-destructive/10 rounded-xl border p-3 text-sm"
            >
              {mutation.error.message}
            </p>
          )}
          {undo.isError && (
            <p
              role="alert"
              className="border-destructive/40 bg-destructive/10 rounded-xl border p-3 text-sm"
            >
              {undo.error.message}
            </p>
          )}
        </div>

        <DialogFooter className="m-0 px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={busy}>
              {result ? "Fechar" : "Cancelar"}
            </Button>
          </DialogClose>

          {result && !undo.isSuccess && result.logIds.length > 0 && (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => undo.mutate(result.logIds)}
            >
              {undo.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <Undo2Icon />
              )}
              {undo.isPending ? "Desfazendo…" : "Desfazer"}
            </Button>
          )}

          {!result && (
            <Button
              variant={xpPerStudent < 0 ? "destructive" : "default"}
              disabled={
                selectedAttitudes.length === 0 || students.length === 0 || busy
              }
              onClick={() =>
                mutation.mutate({ students, attitudes: selectedAttitudes })
              }
            >
              {mutation.isPending && <Loader2Icon className="animate-spin" />}
              {mutation.isPending
                ? "Aplicando…"
                : selectedAttitudes.length === 0
                  ? "Escolha uma atitude"
                  : `Aplicar ${formatXpDelta(xpPerStudent)} a ${studentsLabel(students.length)}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
