import { CheckIcon, IdCardIcon, TrophyIcon } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

const xpFormatter = new Intl.NumberFormat("pt-BR");

type StudentCardProps = {
  student: User;
  selected: boolean;
  onToggle: (id: string) => void;
  onOpenProfile: (id: string) => void;
};

export function StudentCard({
  student,
  selected,
  onToggle,
  onOpenProfile,
}: StudentCardProps) {
  return (
    <li className="flex items-center gap-1 sm:relative sm:block">
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onToggle(student._id)}
        className={cn(
          "border-border bg-card hover:bg-accent focus-visible:ring-ring/50 relative flex min-h-16 w-full min-w-0 flex-1 items-center gap-3 rounded-xl border p-3 text-left transition-colors outline-none focus-visible:ring-[3px] sm:h-full sm:flex-col sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-center",
          selected &&
            "border-primary bg-primary/10 hover:bg-primary/15 ring-primary/40 ring-2",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded-md border sm:hidden",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input",
          )}
        >
          {selected && <CheckIcon className="size-3.5" />}
        </span>

        {selected && (
          <span className="bg-primary text-primary-foreground absolute top-2 right-2 hidden size-5 place-items-center rounded-full sm:grid">
            <CheckIcon className="size-3" />
          </span>
        )}

        <UserAvatar
          user={student}
          className="size-10 sm:size-14"
          fallbackClassName="text-sm"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:w-full sm:flex-none sm:gap-3">
          <p className="truncate text-sm font-semibold">{student.name}</p>

          <div className="flex flex-wrap gap-1.5 sm:justify-center">
            <Badge className="bg-brand-level/15 text-brand-level">
              Nível {student.level}
            </Badge>
            <Badge className="bg-brand-xp/15 text-brand-xp tabular-nums">
              <TrophyIcon />
              {xpFormatter.format(student.xp)} XP
            </Badge>
          </div>
        </div>
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Ver ficha de ${student.name}`}
        title="Ver ficha"
        className="text-muted-foreground hover:text-foreground shrink-0 rounded-full sm:absolute sm:top-2 sm:left-2 sm:size-7"
        onClick={() => onOpenProfile(student._id)}
      >
        <IdCardIcon className="size-4" />
      </Button>
    </li>
  );
}
