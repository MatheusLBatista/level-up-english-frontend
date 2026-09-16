"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleCheckIcon, KeyRoundIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api";
import { changePasswordSchema, type ChangePasswordInput } from "@/schemas/profile";
import { changePassword } from "@/services/auth";

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const { token } = useAuth();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordInput) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return changePassword({ currentPassword, newPassword }, token);
    },
    onSuccess: () => {
      form.reset();
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);

    if (!next) {
      mutation.reset();
      form.reset();
    }
  }

  const { errors } = form.formState;

  const requestError = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : "Não foi possível alterar a senha agora. Tente de novo."
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRoundIcon />
          Alterar senha
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
          <DialogDescription>
            Você continua conectado depois de trocar.
          </DialogDescription>
        </DialogHeader>

        {mutation.isSuccess ? (
          <div className="border-brand-done/40 bg-brand-done/10 flex flex-col items-center gap-2 rounded-xl border p-8 text-center">
            <CircleCheckIcon className="text-brand-done size-7" />
            <p className="text-sm font-medium">Senha alterada com sucesso.</p>
          </div>
        ) : (
          <form
            noValidate
            id="change-password-form"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <FieldGroup>
              <Field data-invalid={Boolean(errors.currentPassword)}>
                <FieldLabel htmlFor="currentPassword">Senha atual</FieldLabel>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.currentPassword)}
                  disabled={mutation.isPending}
                  {...form.register("currentPassword")}
                />
                <FieldError errors={[errors.currentPassword]} />
              </Field>

              <Field data-invalid={Boolean(errors.newPassword)}>
                <FieldLabel htmlFor="newPassword">Nova senha</FieldLabel>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.newPassword)}
                  disabled={mutation.isPending}
                  {...form.register("newPassword")}
                />
                <FieldError errors={[errors.newPassword]} />
              </Field>

              <Field data-invalid={Boolean(errors.confirmPassword)}>
                <FieldLabel htmlFor="confirmPassword">Confirmar nova senha</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  disabled={mutation.isPending}
                  {...form.register("confirmPassword")}
                />
                <FieldError errors={[errors.confirmPassword]} />
              </Field>

              {requestError && <FieldError>{requestError}</FieldError>}
            </FieldGroup>
          </form>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              {mutation.isSuccess ? "Fechar" : "Cancelar"}
            </Button>
          </DialogClose>

          {!mutation.isSuccess && (
            <Button
              type="submit"
              form="change-password-form"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2Icon className="animate-spin" />}
              {mutation.isPending ? "Alterando..." : "Alterar senha"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
