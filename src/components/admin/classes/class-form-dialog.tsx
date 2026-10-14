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
import { useSaveClass } from "@/hooks/use-save-class";
import { useActiveTeachers } from "@/hooks/use-teachers";
import { ApiError } from "@/lib/api";
import type { ClassSummary } from "@/lib/types";
import { classFormSchema, type ClassFormInput } from "@/schemas/class";

type ClassFormDialogProps = {
  open: boolean;
  schoolClass: ClassSummary | null;
  onClose: () => void;
};

export function ClassFormDialog({
  open,
  schoolClass,
  onClose,
}: ClassFormDialogProps) {
  const mutation = useSaveClass();

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
        <ClassForm
          schoolClass={schoolClass}
          mutation={mutation}
          onSaved={close}
        />
      </DialogContent>
    </Dialog>
  );
}

// O backend responde "Class already exists" em inglês; o path é o que importa.
const serverMessages: Partial<Record<keyof ClassFormInput, string>> = {
  name: "Já existe uma turma com este nome.",
};

const formFields = new Set<string>(["name", "teacher", "active"]);

function isFormField(path: string): path is keyof ClassFormInput {
  return formFields.has(path);
}

type ClassFormProps = {
  schoolClass: ClassSummary | null;
  mutation: ReturnType<typeof useSaveClass>;
  onSaved: () => void;
};

function ClassForm({ schoolClass, mutation, onSaved }: ClassFormProps) {
  const isEditing = schoolClass !== null;
  const teachersQuery = useActiveTeachers();

  const form = useForm<ClassFormInput>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: schoolClass?.name ?? "",
      teacher: schoolClass?.teacher?._id ?? "",
      active: schoolClass?.active ?? true,
    },
  });

  const { errors } = form.formState;
  const hasFieldErrors = Object.keys(errors).length > 0;

  const teachers = (teachersQuery.data ?? []).map((teacher) => ({
    id: teacher._id,
    label: teacher.name,
  }));

  // Professor desativado continua ligado à turma, mas não vem na lista de ativos.
  const currentTeacher = schoolClass?.teacher;
  if (
    currentTeacher &&
    !teachers.some((item) => item.id === currentTeacher._id)
  ) {
    teachers.unshift({
      id: currentTeacher._id,
      label: `${currentTeacher.name} (inativo)`,
    });
  }

  function handleSubmit(values: ClassFormInput) {
    mutation.mutate(
      { classId: schoolClass?._id ?? null, values },
      {
        onSuccess: onSaved,
        onError: (error) => {
          if (!(error instanceof ApiError)) {
            return;
          }

          for (const item of error.errors) {
            if (item.path && isFormField(item.path)) {
              form.setError(item.path, {
                message: serverMessages[item.path] ?? item.message,
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
        <DialogTitle>{isEditing ? "Editar turma" : "Nova turma"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Altere o nome, o professor responsável ou o status da turma."
            : "Cadastre a turma e escolha o professor responsável."}
        </DialogDescription>
      </DialogHeader>

      <form
        noValidate
        id="class-form"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FieldGroup>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="class-name">Nome da turma</FieldLabel>
            <Input
              id="class-name"
              placeholder="Ex.: Turma A — Iniciantes"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              disabled={mutation.isPending}
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={Boolean(errors.teacher)}>
            <FieldLabel htmlFor="class-teacher">Professor</FieldLabel>
            <Controller
              control={form.control}
              name="teacher"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={mutation.isPending || teachersQuery.isPending}
                >
                  <SelectTrigger
                    id="class-teacher"
                    className="w-full"
                    aria-invalid={Boolean(errors.teacher)}
                  >
                    <SelectValue
                      placeholder={
                        teachersQuery.isPending
                          ? "Carregando professores…"
                          : "Escolha um professor"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {teachersQuery.isError ? (
              <FieldError>
                Não foi possível carregar os professores.{" "}
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={() => void teachersQuery.refetch()}
                >
                  Tentar de novo
                </button>
              </FieldError>
            ) : teachersQuery.isSuccess && teachers.length === 0 ? (
              <FieldDescription>
                Nenhum professor ativo cadastrado ainda.
              </FieldDescription>
            ) : (
              <FieldError errors={[errors.teacher]} />
            )}
          </Field>

          {isEditing && (
            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Switch
                    id="class-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={mutation.isPending}
                  />
                  <FieldLabel htmlFor="class-active">Turma ativa</FieldLabel>
                </Field>
              )}
            />
          )}

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
          form="class-form"
          className="bg-brand-gradient"
          disabled={mutation.isPending}
        >
          {mutation.isPending && <Loader2Icon className="animate-spin" />}
          {mutation.isPending
            ? "Salvando…"
            : isEditing
              ? "Salvar alterações"
              : "Criar turma"}
        </Button>
      </DialogFooter>
    </>
  );
}
