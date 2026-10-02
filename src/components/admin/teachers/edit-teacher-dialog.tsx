"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
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
import { useEditTeacher } from "@/hooks/use-teacher-mutations";
import { ApiError } from "@/lib/api";
import type { ClassSummary, User } from "@/lib/types";
import { editTeacherSchema, type EditTeacherInput } from "@/schemas/teacher";

type EditTeacherDialogProps = {
  open: boolean;
  teacher: User | null;
  /** Turmas ativas da escola. */
  classes: ClassSummary[];
  onClose: () => void;
};

export function EditTeacherDialog({
  open,
  teacher,
  classes,
  onClose,
}: EditTeacherDialogProps) {
  const mutation = useEditTeacher();

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
        {teacher && (
          <EditTeacherForm
            teacher={teacher}
            classes={classes}
            mutation={mutation}
            onSaved={close}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type EditTeacherFormProps = {
  teacher: User;
  classes: ClassSummary[];
  mutation: ReturnType<typeof useEditTeacher>;
  onSaved: () => void;
};

function EditTeacherForm({
  teacher,
  classes,
  mutation,
  onSaved,
}: EditTeacherFormProps) {
  const currentClassIds = classes
    .filter((item) => item.teacher?._id === teacher._id)
    .map((item) => item._id);

  const form = useForm<EditTeacherInput>({
    resolver: zodResolver(editTeacherSchema),
    defaultValues: { name: teacher.name, classes: currentClassIds },
  });

  const { errors } = form.formState;

  function handleSubmit(values: EditTeacherInput) {
    mutation.mutate(
      { teacher, currentClassIds, values },
      {
        onSuccess: onSaved,
        onError: (error) => {
          if (error instanceof ApiError) {
            for (const item of error.errors) {
              if (item.path === "name") {
                form.setError("name", { message: item.message });
              }
            }
          }
        },
      },
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar professor</DialogTitle>
        <DialogDescription className="break-all">{teacher.email}</DialogDescription>
      </DialogHeader>

      <form
        noValidate
        id="edit-teacher-form"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FieldGroup>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="edit-teacher-name">Nome completo</FieldLabel>
            <Input
              id="edit-teacher-name"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              disabled={mutation.isPending}
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field>
            <FieldLabel>Turmas responsáveis</FieldLabel>
            <Controller
              control={form.control}
              name="classes"
              render={({ field }) => (
                <ClassChecklist
                  classes={classes}
                  value={field.value}
                  onChange={field.onChange}
                  teacherId={teacher._id}
                  disabled={mutation.isPending}
                />
              )}
            />
            <FieldDescription>
              Desmarcar uma turma a deixa sem professor até você escolher outro.
            </FieldDescription>
          </Field>

          {mutation.isError && !errors.name && (
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
          form="edit-teacher-form"
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
