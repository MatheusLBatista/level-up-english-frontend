"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import type { User } from "@/lib/types";
import { removeAvatar, uploadAvatar } from "@/services/users";

/** `File` troca a foto; `null` remove. Vale só para a própria conta. */
export function useUpdateAvatar() {
  const { user, token, updateUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File | null) => {
      if (!user || !token) {
        throw new Error("Sua sessão expirou. Entre de novo para continuar.");
      }

      return file
        ? uploadAvatar(user._id, file, token)
        : removeAvatar(user._id, token);
    },
    // A resposta do PATCH não traz o e-mail: só a foto entra no que já existe.
    onSuccess: (updated) => {
      const avatar_url = updated.avatar_url ?? null;

      if (user) {
        updateUser({ ...user, avatar_url });
      }

      queryClient.setQueryData<User>(["users", updated._id], (current) =>
        current ? { ...current, avatar_url } : current,
      );

      return queryClient.invalidateQueries({ queryKey: ["rankings"] });
    },
  });
}
