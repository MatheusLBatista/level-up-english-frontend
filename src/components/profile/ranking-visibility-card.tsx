"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import { updateUser } from "@/services/users";

export function RankingVisibilityCard({ user }: { user: User }) {
  const { token, updateUser: updateSessionUser } = useAuth();
  const queryClient = useQueryClient();
  const visible = user.show_in_global_ranking ?? true;

  // Sem atualização otimista: o switch só muda depois que a API confirma.
  const mutation = useMutation({
    mutationFn: (next: boolean) => {
      if (!token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return updateUser(user._id, { show_in_global_ranking: next }, token);
    },
    // A resposta do PATCH não traz o e-mail: mescla com o que já existe.
    onSuccess: (updated) => {
      const merged = { ...user, ...updated };

      queryClient.setQueryData(["users", updated._id], merged);
      updateSessionUser(merged);

      return queryClient.invalidateQueries({ queryKey: ["rankings"] });
    },
  });

  const requestError = mutation.error
    ? mutation.error instanceof ApiError
      ? mutation.error.message
      : "Não foi possível salvar agora. Tente de novo."
    : null;

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-2">
        <Field
          orientation="horizontal"
          data-disabled={mutation.isPending || undefined}
        >
          <FieldContent>
            <FieldLabel htmlFor="show-in-global-ranking">
              Aparecer no ranking geral
            </FieldLabel>
            <FieldDescription id="show-in-global-ranking-description">
              Se desligar, você continua no ranking da sua turma.
            </FieldDescription>
          </FieldContent>
          <Switch
            id="show-in-global-ranking"
            aria-describedby="show-in-global-ranking-description"
            checked={visible}
            disabled={mutation.isPending}
            onCheckedChange={(next) => mutation.mutate(next)}
          />
        </Field>

        {requestError && <FieldError>{requestError}</FieldError>}
      </CardContent>
    </Card>
  );
}
