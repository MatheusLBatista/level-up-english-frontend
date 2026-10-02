"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, MailCheckIcon, UserPlusIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { ClassChecklist } from "@/components/admin/teachers/class-checklist";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRegisterTeacher } from "@/hooks/use-teacher-mutations";
import { ApiError } from "@/lib/api";
import type { ClassSummary } from "@/lib/types";
import {
  createTeacherSchema,
  type CreateTeacherInput,
} from "@/schemas/teacher";

type CreateTeacherDialogProps = {
  open: boolean;
  classes: ClassSummary[];
  onClose: () => void;
};

export function CreateTeacherDialog({
  open,
  classes,
  onClose,
}: CreateTeacherDialogProps) {
  const mutation = useRegisterTeacher();

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
        {mutation.isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Professor cadastrado</DialogTitle>
              <DialogDescription className="sr-only">
                Confirmação do cadastro do professor.
              </DialogDescription>
            </DialogHeader>

            <div className="border-brand-done/40 bg-brand-done/10 flex flex-col items-center gap-3 rounded-xl border p-6 text-center">
              <MailCheckIcon className="text-brand-done size-8" />
              <p className="text-sm">
                Enviamos um e-mail para{" "}
                <strong className="break-all">{mutation.data.email}</strong> com
                o link para {mutation.data.name} criar a senha.
              </p>
              <p className="text-muted-foreground text-xs">
                O link vale por 24 horas. Depois disso, use “Esqueci minha
                senha” no login.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => mutation.reset()}>
                <UserPlusIcon />
                Cadastrar outro
              </Button>
              <DialogClose asChild>
                <Button className="bg-brand-gradient">Concluir</Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <CreateTeacherForm classes={classes} mutation={mutation} />
        )}
      </DialogContent>
    </Dialog>
  );
}

const formFields = new Set<string>(["name", "email", "classes"]);

function isFormField(path: string): path is keyof CreateTeacherInput {
  return formFields.has(path);
}

type CreateTeacherFormProps = {
  classes: ClassSummary[];
  mutation: ReturnType<typeof useRegisterTeacher>;
};

function CreateTeacherForm({ classes, mutation }: CreateTeacherFormProps) {
  const form = useForm<CreateTeacherInput>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: { name: "", email: "", classes: [] },
  });

  const { errors } = form.formState;
  const hasFieldErrors = Object.keys(errors).length > 0;

  function handleSubmit(values: CreateTeacherInput) {
    mutation.mutate(values, {
      onError: (error) => {
        if (!(error instanceof ApiError)) {
          return;
        }

        for (const item of error.errors) {
          if (item.path && isFormField(item.path)) {
            form.setError(item.path, { message: item.message });
          }
        }
      },
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Novo professor</DialogTitle>
        <DialogDescription>
          O professor recebe um e-mail para criar a própria senha.
        </DialogDescription>
      </DialogHeader>

      <form
        noValidate
        id="teacher-form"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FieldGroup>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="teacher-name">Nome completo</FieldLabel>
            <Input
              id="teacher-name"
              placeholder="Ex.: Roberto Lima"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              disabled={mutation.isPending}
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="teacher-email">E-mail</FieldLabel>
            <Input
              id="teacher-email"
              type="email"
              placeholder="roberto@escola.com"
              autoComplete="off"
              aria-invalid={Boolean(errors.email)}
              disabled={mutation.isPending}
              {...form.register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={Boolean(errors.classes)}>
            <FieldLabel>Turmas responsáveis (opcional)</FieldLabel>
            <Controller
              control={form.control}
              name="classes"
              render={({ field }) => (
                <ClassChecklist
                  classes={classes}
                  value={field.value}
                  onChange={field.onChange}
                  teacherId={null}
                  disabled={mutation.isPending}
                />
              )}
            />
            {errors.classes ? (
              <FieldError errors={[errors.classes]} />
            ) : (
              <FieldDescription>
                Uma turma que já tem professor passa para o novo.
              </FieldDescription>
            )}
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
          form="teacher-form"
          className="bg-brand-gradient"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <UserPlusIcon />
          )}
          {mutation.isPending ? "Cadastrando…" : "Cadastrar professor"}
        </Button>
      </DialogFooter>
    </>
  );
}
