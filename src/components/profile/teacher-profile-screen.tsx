"use client";

import { UserRoundIcon } from "lucide-react";
import { TeacherActivityCard } from "@/components/profile/teacher-activity-card";
import { TeacherBadgeCard } from "@/components/profile/teacher-badge-card";
import { TeacherClassesCard } from "@/components/profile/teacher-classes-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useMyAttitudeLogs } from "@/hooks/use-attitude-logs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTeacherClasses } from "@/hooks/use-teacher-classes";

/** Perfil do professor e do admin. Para o admin, as turmas são as da escola toda. */
export function TeacherProfileScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const userQuery = useCurrentUser();
  const classesQuery = useTeacherClasses();
  const logsQuery = useMyAttitudeLogs();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <UserRoundIcon className="text-primary size-8" />
        <h1 className="text-3xl font-extrabold tracking-tight">Meu Perfil</h1>
      </div>

      {userQuery.isPending ? (
        <Skeleton className="h-44 rounded-xl" />
      ) : userQuery.isError ? (
        <div className="border-destructive/40 bg-destructive/10 flex flex-wrap items-center gap-3 rounded-xl border p-4">
          <p className="text-sm">{userQuery.error.message}</p>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => void userQuery.refetch()}
          >
            Tentar de novo
          </Button>
        </div>
      ) : (
        <>
          <TeacherBadgeCard
            user={userQuery.data}
            classes={isAdmin ? undefined : classesQuery.data}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <TeacherClassesCard
              title={isAdmin ? "Turmas da escola" : "Suas turmas"}
              classes={classesQuery.data}
              isError={classesQuery.isError}
              onRetry={() => void classesQuery.refetch()}
            />
            <TeacherActivityCard
              page={logsQuery.data}
              isError={logsQuery.isError}
              onRetry={() => void logsQuery.refetch()}
            />
          </div>
        </>
      )}
    </div>
  );
}
