import { TrophyIcon } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import type { RankingEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const xpFormatter = new Intl.NumberFormat("pt-BR");

const podiumStyles: Record<number, string> = {
  1: "text-brand-level",
  2: "text-foreground/70",
  3: "text-brand-reward",
};

type RankingRowProps = {
  entry: RankingEntry;
  position: number;
  isCurrentUser: boolean;
};

export function RankingRow({
  entry,
  position,
  isCurrentUser,
}: RankingRowProps) {
  const podium = podiumStyles[position];

  return (
    <li
      className={cn(
        "flex items-center gap-4 px-4 py-3 transition-colors sm:px-5",
        isCurrentUser && "bg-primary/10 ring-primary/30 rounded-xl ring-1",
      )}
    >
      <span className="w-8 shrink-0 text-center">
        {podium ? (
          <TrophyIcon className={cn("mx-auto size-5", podium)} aria-hidden />
        ) : (
          <span className="text-muted-foreground text-sm font-semibold tabular-nums">
            {position}
          </span>
        )}
        <span className="sr-only">{position}º lugar</span>
      </span>

      <UserAvatar
        user={entry.user}
        className={cn(
          "size-10 shrink-0",
          position === 1 && "ring-brand-level/60 ring-2",
        )}
        fallbackClassName="text-xs"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold">{entry.user.name}</p>

          {position === 1 && (
            <Badge className="bg-brand-level/20 text-brand-level text-label">
              1º lugar
            </Badge>
          )}

          {isCurrentUser && (
            <Badge variant="outline" className="text-label">
              Você
            </Badge>
          )}
        </div>

        <p className="text-muted-foreground text-xs font-medium">
          Nível {entry.level}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-brand-xp text-xl font-bold tabular-nums">
          {xpFormatter.format(entry.xp)}
          <span className="text-muted-foreground text-label block font-medium sm:ml-1 sm:inline sm:text-sm">
            XP
          </span>
        </p>
      </div>
    </li>
  );
}
