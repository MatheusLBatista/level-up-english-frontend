import { AwardIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { countCompleted } from "@/lib/missions";
import type { User } from "@/lib/types";

function humanizeBadge(badge: string) {
  const label = badge.replaceAll(/[_-]/g, " ");

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function ProfileBadges({ user }: { user: User }) {
  const completed = countCompleted(user);

  return (
    <Card className="border-border/40 bg-card/60 h-full backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Conquistas</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-6">
        <div>
          <p className="text-brand-done text-2xl font-bold tabular-nums">
            {completed}
          </p>
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Missões concluídas
          </p>
        </div>

        {user.badges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badge) => (
              <Badge key={badge} variant="outline" className="gap-1.5">
                <AwardIcon className="text-brand-level" />
                {humanizeBadge(badge)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Nenhuma medalha ainda. Conclua missões para desbloquear.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
