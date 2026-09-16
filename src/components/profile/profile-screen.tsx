"use client";

import { UserRoundIcon } from "lucide-react";
import { ProfileBadges } from "@/components/profile/profile-badges";
import { ProfileClass } from "@/components/profile/profile-class";
import { ProfileIdentity } from "@/components/profile/profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";

export function ProfileScreen() {
  const userQuery = useCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <UserRoundIcon className="text-primary size-8" />
        <h1 className="text-3xl font-extrabold tracking-tight">Meu Perfil</h1>
      </div>

      {userQuery.isPending ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-52 rounded-xl" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
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
        <div className="flex flex-col gap-4">
          <ProfileIdentity user={userQuery.data} />

          <div className="grid gap-4 md:grid-cols-2">
            <ProfileClass user={userQuery.data} />
            <ProfileBadges user={userQuery.data} />
          </div>
        </div>
      )}
    </div>
  );
}
