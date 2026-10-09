"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircleMinusIcon,
  CirclePlusIcon,
  Loader2Icon,
  PartyPopperIcon,
  TriangleAlertIcon,
  TrophyIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAdjustXp } from "@/hooks/use-adjust-xp";
import { formatXpDelta } from "@/lib/attitudes";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  xpAdjustmentSchema,
  type XpAdjustmentInput,
} from "@/schemas/xp-adjustment";

type Mode = "add" | "remove";

const modes = [
  { value: "add", label: "Adicionar", icon: CirclePlusIcon },
  { value: "remove", label: "Remover", icon: CircleMinusIcon },
] as const;

type AdjustXpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: User[];
  onFinished: () => void;
};

export function AdjustXpDialog({
  open,
  onOpenChange,
  students,
  onFinished,
}: AdjustXpDialogProps) {
  const [mode, setMode] = useState<Mode>("add");
  const mutation = useAdjustXp();
  const result = mutation.data;

  const form = useForm<XpAdjustmentInput>({
    resolver: zodResolver(xpAdjustmentSchema),
    defaultValues: { reason: "" },
  });

  const amount = useWatch({ control: form.control, name: "amount" });
  const shortOfXp =
    mode === "remove" && Number.isFinite(amount)
      ? students.filter((student) => student.xp < amount)
      : [];

  const capped =
    result?.succeeded.filter(
      (outcome) => outcome.xpApplied !== result.amount,
    ) ?? [];

  function handleOpenChange(next: boolean) {
    if (!next) {
      if (mutation.isPending) {
        return;
      }

      if (result) {
        onFinished();
      }

      mutation.reset();
      form.reset();
      setMode("add");
    }

    onOpenChange(next);
  }

  function handleSubmit(values: XpAdjustmentInput) {
    mutation.mutate({
      students,
      amount: mode === "add" ? values.amount : -values.amount,
      reason: values.reason || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] gap-6 overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar saldo</DialogTitle>
          <DialogDescription>
            Ajuste de XP para{" "}
            {students.length === 1
              ? students[0].name
              : `${students.length} alunos`}
            .
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-3">
            {result.succeeded.length > 0 && (
              <div className="border-brand-done/40 bg-brand-done/10 flex flex-col items-center gap-2 rounded-xl border p-6 text-center">
                <PartyPopperIcon className="text-brand-done size-8" />
                <p className="text-lg font-semibold">
                  {result.succeeded.length === 1
                    ? "Saldo ajustado"
                    : `Saldo de ${result.succeeded.length} alunos ajustado`}
                </p>
                <p className="text-muted-foreground text-sm tabular-nums">
                  {formatXpDelta(result.amount)}
                  {result.succeeded.length > 1 && " por aluno"}
                </p>
              </div>
            )}

            {capped.length > 0 && (
              <div className="border-brand-level/40 bg-brand-level/10 rounded-xl border p-4 text-sm">
                <p className="mb-1 font-semibold">Saldo insuficiente</p>
                <ul className="flex flex-col gap-1">
                  {capped.map(({ student, xpApplied }) => (
                    <li key={student._id}>
                      <span className="font-medium">{student.name}</span>:
                      removidos {Math.abs(xpApplied)} de{" "}
                      {Math.abs(result.amount)} XP
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.failures.length > 0 && (
              <div className="border-destructive/40 bg-destructive/10 flex flex-col gap-2 rounded-xl border p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <TriangleAlertIcon className="text-destructive size-5" />
                  {result.failures.length} ajuste(s) falharam
                </p>
                <ul className="flex flex-col gap-1">
                  {result.failures.map(({ student, message }) => (
                    <li key={student._id}>
                      <span className="font-medium">{student.name}</span>:{" "}
                      <span className="text-muted-foreground">{message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <form
            noValidate
            id="adjust-xp-form"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FieldGroup>
              <div
                role="group"
                aria-label="Tipo de ajuste"
                className="border-border/40 bg-card/60 grid grid-cols-2 gap-1 rounded-xl border p-1"
              >
                {modes.map(({ value, label, icon: Icon }) => {
                  const isActive = mode === value;

                  return (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-pressed={isActive}
                      disabled={mutation.isPending}
                      onClick={() => setMode(value)}
                      className={cn(
                        "rounded-lg text-xs font-semibold tracking-wide uppercase",
                        isActive &&
                          (value === "add"
                            ? "bg-brand-done hover:bg-brand-done text-white hover:text-white"
                            : "bg-destructive hover:bg-destructive text-white hover:text-white"),
                      )}
                    >
                      <Icon />
                      {label}
                    </Button>
                  );
                })}
              </div>

              <Field data-invalid={Boolean(form.formState.errors.amount)}>
                <FieldLabel htmlFor="amount">
                  {mode === "add" ? "XP a adicionar" : "XP a remover"}
                </FieldLabel>
                <div className="relative">
                  <TrophyIcon
                    className={cn(
                      "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
                      mode === "add" ? "text-brand-xp" : "text-destructive",
                    )}
                  />
                  <Input
                    id="amount"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={10000}
                    step={1}
                    placeholder="0"
                    className="pl-9 tabular-nums"
                    aria-invalid={Boolean(form.formState.errors.amount)}
                    disabled={mutation.isPending}
                    {...form.register("amount", { valueAsNumber: true })}
                  />
                </div>
                <FieldError errors={[form.formState.errors.amount]} />
              </Field>

              <Field data-invalid={Boolean(form.formState.errors.reason)}>
                <FieldLabel htmlFor="reason">Motivo (opcional)</FieldLabel>
                <Input
                  id="reason"
                  placeholder="Ex.: ajudou a organizar a feira de ciências"
                  aria-invalid={Boolean(form.formState.errors.reason)}
                  disabled={mutation.isPending}
                  {...form.register("reason")}
                />
                <FieldError errors={[form.formState.errors.reason]} />
              </Field>

              {shortOfXp.length > 0 && (
                <p className="border-brand-level/40 bg-brand-level/10 rounded-xl border p-3 text-sm">
                  {shortOfXp.length === 1
                    ? `${shortOfXp[0].name} tem só ${shortOfXp[0].xp} XP`
                    : `${shortOfXp.length} alunos têm menos de ${amount} XP`}
                  {" — o saldo vai parar em 0."}
                </p>
              )}

              {mutation.isError && (
                <FieldError>{mutation.error.message}</FieldError>
              )}
            </FieldGroup>
          </form>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={mutation.isPending}>
              {result ? "Fechar" : "Cancelar"}
            </Button>
          </DialogClose>

          {!result && (
            <Button
              type="submit"
              form="adjust-xp-form"
              variant={mode === "remove" ? "destructive" : "default"}
              className={cn(mode === "add" && "bg-brand-gradient")}
              disabled={mutation.isPending || students.length === 0}
            >
              {mutation.isPending && <Loader2Icon className="animate-spin" />}
              {mutation.isPending
                ? "Salvando…"
                : mode === "add"
                  ? "Confirmar adição"
                  : "Confirmar remoção"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
