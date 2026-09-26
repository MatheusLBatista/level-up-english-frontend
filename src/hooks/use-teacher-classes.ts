import { skipToken, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { listClasses } from "@/services/classes";

export function useTeacherClasses() {
  const { token, user } = useAuth();
  const teacher = user?.role === "teacher" ? user._id : undefined;

  return useQuery({
    queryKey: ["classes", "list", { teacher }],
    queryFn: token ? () => listClasses(token, { teacher }) : skipToken,
    select: (page) => page.docs,
    staleTime: 10 * 60 * 1000,
  });
}
