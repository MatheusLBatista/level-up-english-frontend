"use client";

import { CheckIcon, PartyPopperIcon, TriangleAlertIcon } from "lucide-react";
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
import { useApplyAttitudes } from "@/hooks/use-apply-attitudes";
import { useAttitudes } from "@/hooks/use-attitudes";
import { formatXpDelta, getAttitudeXp } from "@/lib/attitudes";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

function describeStudents(students: User[]) {
  if (students.length === 1) {
    return students[0].name;
  }

  const names = students.map((student) => student.name.split(" ")[0]);
  const preview =
    names.length <= 3
      ? names.join(", ")
      : `${names.slice(0, 2).join(", ")} e mais ${names.length - 2}`;

  return `${students.length} alunos (${preview})`;
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

  const attitudes = attitudesQuery.data ?? [];
  const selectedAttitudes = attitudes.filter((attitude) => selectedIds.has(attitude._id));
  const xpPerStudent = selectedAttitudes.reduce(
    (sum, attitude) => sum + getAttitudeXp(attitude),
    0,
  );
  const result = mutation.data;

  function handleOpenChange(next: boolean) {
    if (!next) {
      if (mutation.isPending) {
        return;
      }

      if (result) {
        onFinished();
      }

      mutation.reset();
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] gap-6 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Aplicar atitudes</DialogTitle>
          <DialogDescription>
            Selecione uma ou mais atitudes para {describeStudents(students)}.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          result.failures.length === 0 ? (
            <div className="border-brand-done/40 bg-brand-done/10 flex flex-col items-center gap-2 rounded-xl border p-8 text-center">
              <PartyPopperIcon className="text-brand-done size-8" />
              <p className="text-lg font-semibold">
                {result.applied === 1
                  ? "Atitude aplicada"
                  : `${result.applied} atitudes aplicadas`}
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
                    <span className="font-medium">{failure.student.name}</span> ·{" "}
                    {failure.attitude.name}:{" "}
                    <span className="text-muted-foreground">{failure.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : attitudesQuery.isPending ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-14 rounded-xl" />
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
          <p className="text-muted-foreground border-border/40 rounded-xl border border-dashed p-8 text-center text-sm">
            Nenhuma atitude ativa cadastrada.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {attitudes.map((attitude) => {
              const xp = getAttitudeXp(attitude);
              const selected = selectedIds.has(attitude._id);

              return (
                <li key={attitude._id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    disabled={mutation.isPending}
                    onClick={() => toggleAttitude(attitude._id)}
                    className={cn(
                      "border-border/40 bg-card/60 hover:bg-card/80 focus-visible:ring-ring/50 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors outline-none focus-visible:ring-[3px] disabled:opacity-60",
                      selected && "border-primary bg-primary/10 hover:bg-primary/15",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        attitude.type === "positive" ? "bg-brand-done" : "bg-destructive",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {attitude.name}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium tabular-nums",
                          xp >= 0 ? "text-brand-done" : "text-destructive",
                        )}
                      >
                        {formatXpDelta(xp)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full border",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border",
                      )}
                    >
                      {selected && <CheckIcon className="size-3" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {!result && selectedAttitudes.length > 0 && (
          <p className="text-muted-foreground text-sm">
            Cada aluno recebe{" "}
            <span
              className={cn(
                "font-semibold tabular-nums",
                xpPerStudent >= 0 ? "text-brand-done" : "text-destructive",
              )}
            >
              {formatXpDelta(xpPerStudent)}
            </span>
            .
          </p>
        )}

        {mutation.isError && (
          <p className="border-destructive/40 bg-destructive/10 rounded-xl border p-3 text-sm">
            {mutation.error.message}
          </p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={mutation.isPending}>
              {result ? "Fechar" : "Cancelar"}
            </Button>
          </DialogClose>

          {!result && (
            <Button
              className="bg-brand-gradient"
              disabled={
                selectedAttitudes.length === 0 ||
                students.length === 0 ||
                mutation.isPending
              }
              onClick={() => mutation.mutate({ students, attitudes: selectedAttitudes })}
            >
              <CheckIcon />
              {mutation.isPending ? "Aplicando…" : "Concluir"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
