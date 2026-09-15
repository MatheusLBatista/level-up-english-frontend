import { skipToken, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api";
import { getUserById } from "@/services/users";

export function useCurrentUser() {
  const { user, token, signOut } = useAuth();
  const id = user?._id;

  const query = useQuery({
    queryKey: ["users", id],
    queryFn: id && token ? () => getUserById(id, token) : skipToken,
    staleTime: 30 * 1000,
  });

  const isUnauthorized =
    query.error instanceof ApiError && query.error.status === 401;

  useEffect(() => {
    if (isUnauthorized) {
      signOut();
    }
  }, [isUnauthorized, signOut]);

  return query;
}
