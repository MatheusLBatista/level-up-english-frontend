import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { getUserById } from "@/services/users";

export function useCurrentUser() {
  const { user, token } = useAuth();
  const id = user?._id;

  const query = useQuery({
    queryKey: ["users", id],
    queryFn: id && token ? () => getUserById(id, token) : skipToken,
    staleTime: 30 * 1000,
  });

  return query;
}
