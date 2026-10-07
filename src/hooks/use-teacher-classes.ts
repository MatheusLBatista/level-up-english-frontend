import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { listClasses } from "@/services/classes";

/**
 * Turmas do professor logado; para o admin, todas as turmas ativas.
 * `enabled: false` pula a busca (ex.: a tela de ranking aberta por um aluno).
 */
export function useTeacherClasses(enabled = true) {
  const { token, user } = useAuth();
  const teacher = user?.role === "teacher" ? user._id : undefined;

  return useQuery({
    queryKey: ["classes", "list", { teacher }],
    queryFn:
      token && enabled ? () => listClasses(token, { teacher }) : skipToken,
    select: (page) => page.docs,
    staleTime: 10 * 60 * 1000,
  });
}
