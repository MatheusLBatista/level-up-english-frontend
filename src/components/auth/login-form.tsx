"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { login } from "@/services/auth";

export function LoginForm() {
  const { signIn } = useAuth();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      signIn(session);
    }
  });

  const { errors } = form.formState;

  const requestError = loginMutation.error
    ? loginMutation.error instanceof ApiError
      ? loginMutation.error.message : "Não foi possível entrar agora. Verifique sua conexão e tente de novo."
    : null;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Entrar</CardTitle>
        <CardDescription>Acesse sua conta</CardDescription>
      </CardHeader>

      <CardContent>
        <form
        noValidate
        onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
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
                disabled={loginMutation.isPending}
                {...form.register("email")}
              />
               <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••"
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
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
