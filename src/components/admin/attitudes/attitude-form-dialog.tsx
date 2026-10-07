"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, SaveIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { AttitudeCard } from "@/components/admin/attitudes/attitude-card";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveAttitude } from "@/hooks/use-save-attitude";
import { ApiError } from "@/lib/api";
import { toAttitudeBody, toAttitudeFormValues } from "@/lib/attitudes";
import type { Attitude } from "@/lib/types";
import { attitudeFormSchema, type AttitudeFormInput } from "@/schemas/attitude";

type AttitudeFormDialogProps = {
  open: boolean;
  /** `null` abre o formulário de cadastro. */
  attitude: Attitude | null;
  onClose: () => void;
};

export function AttitudeFormDialog({
  open,
  attitude,
  onClose,
}: AttitudeFormDialogProps) {
  const mutation = useSaveAttitude();

  function close() {
    mutation.reset();
    onClose();
  }

  function handleOpenChange(next: boolean) {
    if (!next && !mutation.isPending) {
      close();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] gap-6 overflow-y-auto sm:max-w-md">
        <AttitudeForm attitude={attitude} mutation={mutation} onSaved={close} />
      </DialogContent>
    </Dialog>
  );
}

/** Campos do backend que têm um campo equivalente no formulário. */
const fieldByApiPath: Record<string, keyof AttitudeFormInput> = {
  name: "name",
  description: "description",
  xp_value: "xp",
  type: "xp",
};

type AttitudeFormProps = {
  attitude: Attitude | null;
  mutation: ReturnType<typeof useSaveAttitude>;
  onSaved: () => void;
};

function AttitudeForm({ attitude, mutation, onSaved }: AttitudeFormProps) {
  const form = useForm<AttitudeFormInput>({
    resolver: zodResolver(attitudeFormSchema),
    defaultValues: toAttitudeFormValues(attitude),
  });

  const { errors } = form.formState;
  const hasFieldErrors = Object.keys(errors).length > 0;
  const isEditing = attitude !== null;

  const [name, description, xp] = useWatch({
    control: form.control,
    name: ["name", "description", "xp"],
  });
  const preview: Attitude = {
    _id: "preview",
    ...toAttitudeBody({
      name,
      description,
      xp: Number.isFinite(xp) ? xp : 0,
    }),
    name: name.trim() || "Nome da atitude",
    description: description.trim() || null,
    active: true,
  };

  function handleSubmit(values: AttitudeFormInput) {
    mutation.mutate(
      { attitudeId: attitude?._id ?? null, values },
      {
        onSuccess: onSaved,
        onError: (error) => {
          if (!(error instanceof ApiError)) {
            return;
          }

          for (const item of error.errors) {
            const field = item.path ? fieldByApiPath[item.path] : undefined;

            if (field) {
              form.setError(field, {
                message:
                  field === "name"
                    ? "Já existe uma atitude com esse nome."
                    : item.message,
              });
            }
          }
        },
      },
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar atitude" : "Nova atitude"}
        </DialogTitle>
        <DialogDescription>Defina os prêmios ou punições.</DialogDescription>
      </DialogHeader>

      <form
        noValidate
        id="attitude-form"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FieldGroup>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="attitude-name">Nome da atitude</FieldLabel>
            <Input
              id="attitude-name"
              placeholder="Ex.: Ajudou o colega"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              disabled={mutation.isPending}
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={Boolean(errors.xp)}>
            <FieldLabel htmlFor="attitude-xp">XP (ganho ou perda)</FieldLabel>
            <Input
              id="attitude-xp"
              type="number"
              inputMode="numeric"
              step={1}
              aria-invalid={Boolean(errors.xp)}
              disabled={mutation.isPending}
              {...form.register("xp", { valueAsNumber: true })}
            />
            {errors.xp ? (
              <FieldError errors={[errors.xp]} />
            ) : (
              <FieldDescription>
                Positivo premia o aluno; negativo (ex.: -10) é uma punição.
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={Boolean(errors.description)}>
            <FieldLabel htmlFor="attitude-description">
              Descrição (opcional)
            </FieldLabel>
            <Textarea
              id="attitude-description"
              rows={2}
              placeholder="Quando o professor deve aplicar esta atitude?"
              aria-invalid={Boolean(errors.description)}
              disabled={mutation.isPending}
              {...form.register("description")}
            />
            <FieldError errors={[errors.description]} />
          </Field>

          <Field>
            <FieldTitle>Prévia</FieldTitle>
            <ul aria-label="Prévia do card">
              <AttitudeCard attitude={preview} />
            </ul>
          </Field>

          {mutation.isError && !hasFieldErrors && (
            <FieldError>{mutation.error.message}</FieldError>
          )}
        </FieldGroup>
      </form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" disabled={mutation.isPending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button
          type="submit"
          form="attitude-form"
          className="bg-brand-gradient"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <SaveIcon />
          )}
          {mutation.isPending
            ? "Salvando…"
            : isEditing
              ? "Atualizar atitude"
              : "Salvar atitude"}
        </Button>
      </DialogFooter>
    </>
  );
}
