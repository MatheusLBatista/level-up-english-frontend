"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleCheckIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { newPasswordSchema, type NewPasswordInput } from "@/schemas/auth";
import { resetPassword } from "@/services/auth";

const copy = {
  welcome: {
    title: "Crie sua senha",
    description: "Bem-vindo ao LevelUp English! Escolha a senha que você vai usar para entrar.",
    submit: "Criar senha",
  },
  reset: {
    title: "Nova senha",
    description: "Escolha uma senha nova para a sua conta.",
    submit: "Salvar nova senha",
  },
} as const;

type NewPasswordFormProps = {
  code: string | null;
  mode: keyof typeof copy;
};

export function NewPasswordForm({ code, mode }: NewPasswordFormProps) {
  const text = copy[mode];

  const form = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const mutation = useMutation({
    mutationFn: ({ password }: NewPasswordInput) =>
      resetPassword({ code: code ?? "", newPassword: password }),
  });

  const { errors } = form.formState;

  // O único erro com path "code" é link inválido ou expirado.
  const linkExpired =
    !code ||
    (mutation.error instanceof ApiError &&
      mutation.error.errors.some((item) => item.path === "code"));

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>

      <CardContent>
        {mutation.isSuccess ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <CircleCheckIcon className="text-brand-done size-8" />
            <p className="text-sm">Senha salva. Agora é só entrar.</p>
            <Button asChild size="lg" className="w-full">
              <Link href="/login">Ir para o login</Link>
            </Button>
          </div>
        ) : linkExpired ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <TriangleAlertIcon className="text-brand-level size-8" />
            <p className="text-sm">
              Este link é inválido ou já expirou. Peça um link novo, que ele
              chega no seu e-mail.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/esqueci-senha">Pedir um link novo</Link>
            </Button>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <FieldGroup>
              <Field data-invalid={Boolean(errors.password)}>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Pelo menos 6 caracteres"
                  aria-invalid={Boolean(errors.password)}
                  disabled={mutation.isPending}
                  {...form.register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>

              <Field data-invalid={Boolean(errors.confirm)}>
                <FieldLabel htmlFor="confirm">Repita a senha</FieldLabel>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirm)}
                  disabled={mutation.isPending}
                  {...form.register("confirm")}
                />
                <FieldError errors={[errors.confirm]} />
              </Field>

              {mutation.isError && (
                <FieldError>{mutation.error.message}</FieldError>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending && <Loader2Icon className="animate-spin" />}
                {mutation.isPending ? "Salvando…" : text.submit}
              </Button>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
