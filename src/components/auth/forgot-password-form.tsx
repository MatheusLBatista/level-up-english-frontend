"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftIcon, Loader2Icon, MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/schemas/auth";
import { forgotPassword } from "@/services/auth";

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: ({ email }: ForgotPasswordInput) => forgotPassword(email),
  });

  const { errors } = form.formState;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Esqueci minha senha</CardTitle>
        <CardDescription>
          Informe seu e-mail e enviaremos um link para criar uma senha nova.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {mutation.isSuccess ? (
          <div className="border-brand-done/40 bg-brand-done/10 flex flex-col items-center gap-3 rounded-xl border p-5 text-center">
            <MailCheckIcon className="text-brand-done size-7" />
            <p className="text-sm">
              Se existir uma conta com{" "}
              <strong className="break-all">{mutation.variables.email}</strong>,
              o link chega em alguns minutos.
            </p>
            <p className="text-muted-foreground text-xs">
              Ele vale por 30 minutos. Confira também a caixa de spam.
            </p>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            <FieldGroup>
              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="aluno@gmail.com"
                  aria-invalid={Boolean(errors.email)}
                  disabled={mutation.isPending}
                  {...form.register("email")}
                />
                <FieldError errors={[errors.email]} />
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
                {mutation.isPending ? "Enviando…" : "Enviar link"}
              </Button>
            </FieldGroup>
          </form>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild variant="link" className="text-muted-foreground px-0">
          <Link href="/login">
            <ArrowLeftIcon />
            Voltar para o login
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
