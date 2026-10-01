"use client";

import { UserRoundIcon } from "lucide-react";
import { TeacherActivityCard } from "@/components/profile/teacher-activity-card";
import { TeacherBadgeCard } from "@/components/profile/teacher-badge-card";
import { TeacherClassesCard } from "@/components/profile/teacher-classes-card";
import { TeacherSummary } from "@/components/profile/teacher-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAttitudeLogs } from "@/hooks/use-attitude-logs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTeacherClasses } from "@/hooks/use-teacher-classes";
import { summarizeClasses } from "@/lib/teacher";

export function TeacherProfileScreen() {
  const userQuery = useCurrentUser();
  const classesQuery = useTeacherClasses();
  const logsQuery = useMyAttitudeLogs();

  const overview = classesQuery.data
    ? summarizeClasses(classesQuery.data)
    : undefined;

  function retryNumbers() {
    if (classesQuery.isError) void classesQuery.refetch();
    if (logsQuery.isError) void logsQuery.refetch();
  }

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
          <TeacherBadgeCard user={userQuery.data} classes={classesQuery.data} />

          <section aria-label="Resumo" className="py-2">
            <TeacherSummary
              overview={overview}
              attitudeCount={logsQuery.data?.totalDocs}
              isError={classesQuery.isError || logsQuery.isError}
              onRetry={retryNumbers}
            />
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <TeacherClassesCard
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
