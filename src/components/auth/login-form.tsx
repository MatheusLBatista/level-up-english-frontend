"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { AuthInput } from "@/components/auth/auth-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { login } from "@/services/auth";

const signOutNotices = {
  disabled:
    "Sua conta foi desativada. Fale com a coordenação da escola para reativá-la.",
  expired: "Sua sessão expirou. Entre de novo para continuar.",
};

export function LoginForm() {
  const { signIn, signOutReason } = useAuth();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      signIn(session);
    },
  });

  const { errors } = form.formState;

  const requestError = loginMutation.error
    ? loginMutation.error instanceof ApiError
      ? loginMutation.error.message
      : "Não foi possível entrar agora. Verifique sua conexão e tente de novo."
    : null;

  return (
    <Card className="w-full max-w-md gap-8 bg-transparent ring-0 [--card-spacing:0]">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight">
          Entrar
        </CardTitle>
        <CardDescription className="text-foreground/85">
          Acesse sua conta
        </CardDescription>
      </CardHeader>

      <CardContent>
        {signOutReason && !loginMutation.isPending && (
          <p
            role="status"
            className={
              signOutReason === "disabled"
                ? "border-destructive/40 bg-destructive/10 mb-4 rounded-xl border p-3 text-sm"
                : "border-border/40 bg-muted/40 mb-4 rounded-xl border p-3 text-sm"
            }
          >
            {signOutNotices[signOutReason]}
          </p>
        )}

        <form
          noValidate
          onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <AuthInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                aria-invalid={Boolean(errors.email)}
                disabled={loginMutation.isPending}
                {...form.register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Link
                  href="/esqueci-senha"
                  className="text-foreground/85 hover:text-primary text-sm underline-offset-4 hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <AuthInput
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                disabled={loginMutation.isPending}
                {...form.register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>

            {requestError && <FieldError>{requestError}</FieldError>}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-foreground/80 text-center text-sm">
              Não tem acesso? Fale com seu professor.
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
