import { Gamepad2Icon, TriangleAlertIcon, UsersRoundIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ClassSummary } from "@/lib/types";
import { getInitials } from "@/lib/user";
import { cn } from "@/lib/utils";

type ClassRowProps = {
  item: ClassSummary;
  actions?: ReactNode;
};

export function ClassRow({ item, actions }: ClassRowProps) {
  const studentCount = item.students.length;
  const missionCount = item.missions.length;

  return (
    <li
      className={cn(
        "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-6",
        !item.active && "opacity-70",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold">{item.name}</p>
          {!item.active && (
            <Badge
              variant="outline"
              className="border-destructive/40 text-destructive text-[10px] tracking-wider uppercase"
            >
              Inativa
            </Badge>
          )}
        </div>

        {item.teacher ? (
          <p className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
            <Avatar className="size-5">
              <AvatarFallback className="text-[9px] font-semibold">
                {getInitials(item.teacher.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{item.teacher.name}</span>
          </p>
        ) : (
          <p className="text-brand-level mt-1 flex items-center gap-1.5 text-xs font-medium">
            <TriangleAlertIcon className="size-3.5" />
            Sem professor
          </p>
        )}
      </div>

      <dl className="text-muted-foreground flex shrink-0 gap-5 text-sm tabular-nums">
        <div className="flex items-center gap-1.5">
          <dt>
            <UsersRoundIcon className="size-4" aria-label="Alunos" />
          </dt>
          <dd className={cn(studentCount === 0 && "text-brand-level")}>
            {studentCount} {studentCount === 1 ? "aluno" : "alunos"}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt>
            <Gamepad2Icon className="size-4" aria-label="Missões" />
          </dt>
          <dd>
            {missionCount} {missionCount === 1 ? "missão" : "missões"}
          </dd>
        </div>
      </dl>

      {actions && <div className="flex shrink-0 gap-1">{actions}</div>}
    </li>
  );
}
