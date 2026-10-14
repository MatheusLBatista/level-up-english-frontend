import { TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { User } from "@/lib/types";
import { getInitials } from "@/lib/user";
import { cn } from "@/lib/utils";

const xpFormatter = new Intl.NumberFormat("pt-BR");

type StudentRowProps = {
  student: User;
  classLabel?: string | null;
  actions?: ReactNode;
};

export function StudentRow({ student, classLabel, actions }: StudentRowProps) {
  return (
    <li
      className={cn(
        "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-6",
        !student.active && "opacity-70",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-brand-gradient text-xs font-semibold text-white">
            {getInitials(student.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{student.name}</p>
            {!student.active && (
              <Badge
                variant="outline"
                className="border-destructive/40 text-destructive text-[10px] tracking-wider uppercase"
              >
                Inativo
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground truncate text-xs">
            {student.email}
          </p>
        </div>
      </div>

      <div className="w-36 shrink-0 text-sm">
        {student.class ? (
          <span className="truncate">{classLabel ?? "…"}</span>
        ) : (
          <span className="text-brand-level flex items-center gap-1.5 text-xs font-medium">
            <TriangleAlertIcon className="size-3.5" />
            Sem turma
          </span>
        )}
      </div>

      <div className="flex w-48 shrink-0 items-center gap-3 text-sm tabular-nums">
        <span className="text-brand-level font-semibold">
          Nv {student.level}
        </span>
        <Progress
          value={student.progress?.percentage ?? 0}
          aria-label={`${student.progress?.percentage ?? 0}% para o próximo nível`}
          className="h-1 flex-1"
        />
        <span className="text-brand-xp text-xs font-semibold">
          {xpFormatter.format(student.xp)} XP
        </span>
      </div>

      {actions && <div className="flex shrink-0 gap-1">{actions}</div>}
    </li>
  );
}
