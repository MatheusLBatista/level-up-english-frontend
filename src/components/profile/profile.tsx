import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Role, User } from "@/lib/types";
import { getInitials } from "@/lib/user";

const roleLabels: Record<Role, string> = {
  student: "Aluno",
  teacher: "Professor",
  admin: "Administrador",
};

const memberSinceFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const xpFormatter = new Intl.NumberFormat("pt-BR");

export function ProfileIdentity({ user }: { user: User }) {
  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="ring-primary/40 size-16 ring-2">
            <AvatarFallback className="bg-brand-gradient text-lg font-semibold text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-2xl font-bold tracking-tight">
                {user.name}
              </h2>
              <Badge variant="outline">{roleLabels[user.role]}</Badge>
            </div>

            <p className="text-muted-foreground truncate text-sm">{user.email}</p>
            {user.createdAt && (
              <p className="text-muted-foreground text-xs">
                Membro desde{" "}
                {memberSinceFormatter.format(new Date(user.createdAt))}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between gap-3">
            <span className="text-brand-level text-lg font-bold">
              Nível {user.level}
            </span>
            <span className="text-brand-xp font-semibold tabular-nums">
              {xpFormatter.format(user.xp)} XP
            </span>
          </div>

          <Progress value={user.progress.percentage} className="h-2" />

          <p className="text-muted-foreground text-xs">
            {user.progress.next_level_xp === null
              ? "Você chegou ao nível máximo."
              : `Faltam ${xpFormatter.format(user.progress.xp_to_next_level)} XP para o nível ${user.level + 1}.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
