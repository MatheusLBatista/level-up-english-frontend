"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUpdateUser } from "@/hooks/use-update-user";
import { ApiError } from "@/lib/api";
import type { ClassSummary, User } from "@/lib/types";
import {
  editStudentSchema,
  NO_CLASS,
  type EditStudentInput,
} from "@/schemas/student";

type EditStudentDialogProps = {
  open: boolean;
  student: User | null;
  /** Todas as turmas (inclusive inativas, para mostrar a atual do aluno). */
  classes: ClassSummary[];
  onClose: () => void;
};

export function EditStudentDialog({
  open,
  student,
  classes,
  onClose,
}: EditStudentDialogProps) {
  const mutation = useUpdateUser();

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
      <DialogContent className="gap-6 sm:max-w-md">
        {student && (
          <EditStudentForm
            student={student}
            classes={classes}
            mutation={mutation}
            onSaved={close}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

const formFields = new Set<string>(["name", "class", "active"]);

function isFormField(path: string): path is keyof EditStudentInput {
  return formFields.has(path);
}

type EditStudentFormProps = {
  student: User;
  classes: ClassSummary[];
  mutation: ReturnType<typeof useUpdateUser>;
  onSaved: () => void;
};

function EditStudentForm({
  student,
  classes,
  mutation,
  onSaved,
}: EditStudentFormProps) {
  const form = useForm<EditStudentInput>({
    resolver: zodResolver(editStudentSchema),
    defaultValues: {
      name: student.name,
      class: student.class ?? NO_CLASS,
      active: student.active,
    },
  });

  const { errors } = form.formState;
  const hasFieldErrors = Object.keys(errors).length > 0;

  const options = classes.filter(
    (item) => item.active || item._id === student.class,
  );

  function handleSubmit(values: EditStudentInput) {
    mutation.mutate(
      {
        user: student,
        body: {
          name: values.name,
          class: values.class === NO_CLASS ? null : values.class,
          active: values.active,
        },
      },
      {
        onSuccess: onSaved,
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
      },
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar aluno</DialogTitle>
        <DialogDescription className="break-all">{student.email}</DialogDescription>
      </DialogHeader>

      <form
        noValidate
        id="edit-student-form"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FieldGroup>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="edit-student-name">Nome</FieldLabel>
            <Input
              id="edit-student-name"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              disabled={mutation.isPending}
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={Boolean(errors.class)}>
            <FieldLabel htmlFor="edit-student-class">Turma</FieldLabel>
            <Controller
              control={form.control}
              name="class"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger
                    id="edit-student-class"
                    className="w-full"
                    aria-invalid={Boolean(errors.class)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CLASS}>Sem turma</SelectItem>
                    {options.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
                        {!item.active && " (inativa)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.class ? (
              <FieldError errors={[errors.class]} />
            ) : (
              <FieldDescription>
                O XP e o histórico do aluno vão junto se ele mudar de turma.
              </FieldDescription>
            )}
          </Field>

          <Controller
            control={form.control}
            name="active"
            render={({ field }) => (
              <Field orientation="horizontal">
                <Switch
                  id="edit-student-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={mutation.isPending}
                />
                <FieldLabel htmlFor="edit-student-active">
                  Ativo (pode entrar na plataforma)
                </FieldLabel>
              </Field>
            )}
          />

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
          form="edit-student-form"
          className="bg-brand-gradient"
          disabled={mutation.isPending}
        >
          {mutation.isPending && <Loader2Icon className="animate-spin" />}
          {mutation.isPending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </DialogFooter>
    </>
  );
}
