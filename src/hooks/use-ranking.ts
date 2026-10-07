import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api";
import type { RankingScope } from "@/lib/types";
import {
  getClassRanking,
  getGlobalRanking,
  getMyClassRanking,
} from "@/services/rankings";

/**
 * O backend só cria o ranking de uma turma quando alguém dela ganha XP; antes
 * disso a rota responde 404. Para a tela, isso é só um ranking vazio (`null`).
 */
async function getClassRankingOrNull(classId: string, token: string) {
  try {
    return await getClassRanking(classId, token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

/**
 * `classId` só vale no escopo "class": o aluno não passa (usa a própria turma,
 * via `/rankings/me`); professor e admin passam a turma escolhida, e `null`
 * enquanto ela não está definida segura a busca.
 */
export function useRanking(scope: RankingScope, classId?: string | null) {
  const { token } = useAuth();
  const waitingClass = scope === "class" && classId === null;

  return useQuery({
    queryKey: ["rankings", scope, classId ?? "me"],
    queryFn:
      token && !waitingClass
        ? () => {
            if (scope === "global") {
              return getGlobalRanking(token);
            }

            return classId
              ? getClassRankingOrNull(classId, token)
              : getMyClassRanking(token);
          }
        : skipToken,
    staleTime: 2 * 60 * 1000,
  });
}
