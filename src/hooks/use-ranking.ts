import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { getGlobalRanking, getMyClassRanking } from "@/services/rankings";
import type { RankingScope } from "@/lib/types";

export function useRanking(scope: RankingScope) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['rankings', scope],
    queryFn: token ? () => (scope === "global" ? getGlobalRanking(token) : getMyClassRanking(token)) : skipToken,
    staleTime: 2 * 60 * 1000
  });
}
