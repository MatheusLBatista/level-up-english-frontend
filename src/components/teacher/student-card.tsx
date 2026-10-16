import { CheckIcon, IdCardIcon, TrophyIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/user";
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
    <li className="relative">
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onToggle(student._id)}
        className={cn(
          "border-border/40 bg-card/60 hover:bg-card/80 focus-visible:ring-ring/50 relative flex h-full w-full flex-col items-center gap-3 rounded-2xl border p-4 text-center backdrop-blur-sm transition-colors outline-none focus-visible:ring-[3px]",
          selected &&
            "border-primary bg-primary/10 hover:bg-primary/15 ring-primary/40 ring-2",
        )}
      >
        {selected && (
          <span className="bg-primary text-primary-foreground absolute top-2 right-2 grid size-5 place-items-center rounded-full">
            <CheckIcon className="size-3" />
          </span>
        )}

        <Avatar className="size-14">
          <AvatarFallback className="bg-brand-gradient text-sm font-semibold text-white">
            {getInitials(student.name)}
          </AvatarFallback>
        </Avatar>

        <p className="w-full truncate text-sm font-semibold">{student.name}</p>

        <div className="flex flex-wrap justify-center gap-1.5">
          <Badge className="bg-brand-level/15 text-brand-level">
            Nível {student.level}
          </Badge>
          <Badge className="bg-brand-xp/15 text-brand-xp tabular-nums">
            <TrophyIcon />
            {xpFormatter.format(student.xp)} XP
          </Badge>
        </div>
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Ver ficha de ${student.name}`}
        title="Ver ficha"
        className="text-muted-foreground hover:text-foreground absolute top-2 left-2 size-7 rounded-full"
        onClick={() => onOpenProfile(student._id)}
      >
        <IdCardIcon className="size-4" />
      </Button>
    </li>
  );
}
