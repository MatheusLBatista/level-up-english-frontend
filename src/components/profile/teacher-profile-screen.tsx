"use client";

import { UserRoundIcon } from "lucide-react";
import { TeacherBadgeCard } from "@/components/profile/teacher-badge-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTeacherClasses } from "@/hooks/use-teacher-classes";

export function TeacherProfileScreen() {
  const userQuery = useCurrentUser();
  const classesQuery = useTeacherClasses();

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
        <TeacherBadgeCard user={userQuery.data} classes={classesQuery.data} />
      )}
    </div>
  );
}
