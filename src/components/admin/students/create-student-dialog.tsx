"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, MailCheckIcon, UserPlusIcon } from "lucide-react";
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
import { useRegisterStudent } from "@/hooks/use-register-student";
import { ApiError } from "@/lib/api";
import type { ClassSummary } from "@/lib/types";
import {
  NO_CLASS,
  studentFormSchema,
  type StudentFormInput,
} from "@/schemas/student";

type CreateStudentDialogProps = {
  open: boolean;
  /** Turmas ativas: o backend só aceita vincular a turma ativa. */
  classes: ClassSummary[];
  defaultClassId: string | null;
  onClose: () => void;
};

export function CreateStudentDialog({
  open,
  classes,
  defaultClassId,
  onClose,
}: CreateStudentDialogProps) {
  const mutation = useRegisterStudent();

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
        {mutation.isSuccess ? (
          <CreatedStep
            name={mutation.data.name}
            email={mutation.data.email}
            onCreateAnother={() => mutation.reset()}
          />
        ) : (
          <StudentForm
            classes={classes}
            defaultClassId={defaultClassId}
            mutation={mutation}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

const formFields = new Set<string>(["name", "email", "class"]);

function isFormField(path: string): path is keyof StudentFormInput {
  return formFields.has(path);
}

type StudentFormProps = {
  classes: ClassSummary[];
  defaultClassId: string | null;
  mutation: ReturnType<typeof useRegisterStudent>;
};

function StudentForm({ classes, defaultClassId, mutation }: StudentFormProps) {
  const form = useForm<StudentFormInput>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      class: classes.some((item) => item._id === defaultClassId)
        ? (defaultClassId ?? NO_CLASS)
        : NO_CLASS,
    },
  });

  const { errors } = form.formState;
  const hasFieldErrors = Object.keys(errors).length > 0;

  function handleSubmit(values: StudentFormInput) {
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
        <DialogTitle>Novo aluno</DialogTitle>
        <DialogDescription>
          O aluno recebe um e-mail para criar a própria senha.
        </DialogDescription>
      </DialogHeader>

      <form
        noValidate
        id="student-form"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FieldGroup>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="student-name">Nome</FieldLabel>
            <Input
              id="student-name"
              placeholder="Ex.: João Silva"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              disabled={mutation.isPending}
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="student-email">E-mail</FieldLabel>
            <Input
              id="student-email"
              type="email"
              placeholder="joao@email.com"
              autoComplete="off"
              aria-invalid={Boolean(errors.email)}
              disabled={mutation.isPending}
              {...form.register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={Boolean(errors.class)}>
            <FieldLabel htmlFor="student-class">Turma</FieldLabel>
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
                    id="student-class"
                    className="w-full"
                    aria-invalid={Boolean(errors.class)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_CLASS}>Sem turma por enquanto</SelectItem>
                    {classes.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
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
                Sem turma, o aluno não aparece no painel de nenhum professor.
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
          form="student-form"
          className="bg-brand-gradient"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <UserPlusIcon />
          )}
          {mutation.isPending ? "Criando…" : "Criar aluno"}
        </Button>
      </DialogFooter>
    </>
  );
}

type CreatedStepProps = {
  name: string;
  email: string;
  onCreateAnother: () => void;
};

function CreatedStep({ name, email, onCreateAnother }: CreatedStepProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Aluno criado</DialogTitle>
        <DialogDescription className="sr-only">
          Confirmação do cadastro do aluno.
        </DialogDescription>
      </DialogHeader>

      <div className="border-brand-done/40 bg-brand-done/10 flex flex-col items-center gap-3 rounded-xl border p-6 text-center">
        <MailCheckIcon className="text-brand-done size-8" />
        <p className="text-sm">
          <strong>{name}</strong> já está cadastrado. Enviamos um e-mail para{" "}
          <strong className="break-all">{email}</strong> com o link para criar a
          senha.
        </p>
        <p className="text-muted-foreground text-xs">
          O link vale por 24 horas. Se expirar, o aluno pode usar “Esqueci
          minha senha” na tela de login.
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCreateAnother}>
          <UserPlusIcon />
          Criar outro
        </Button>
        <DialogClose asChild>
          <Button className="bg-brand-gradient">Concluir</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}
