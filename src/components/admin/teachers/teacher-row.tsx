import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ClassSummary, User } from "@/lib/types";
import { getInitials } from "@/lib/user";
import { cn } from "@/lib/utils";

type TeacherRowProps = {
  teacher: User;
  /** Turmas ativas em que ele é o professor. */
  classes: ClassSummary[];
  actions?: ReactNode;
};

export function TeacherRow({ teacher, classes, actions }: TeacherRowProps) {
  return (
    <li
      className={cn(
        "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-6",
        !teacher.active && "opacity-70",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="size-9 rounded-xl after:rounded-xl">
          <AvatarFallback className="rounded-xl text-xs font-semibold">
            {getInitials(teacher.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{teacher.name}</p>
            {!teacher.active && (
              <Badge
                variant="outline"
                className="border-destructive/40 text-destructive text-[10px] tracking-wider uppercase"
              >
                Desativado
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground truncate text-xs">{teacher.email}</p>
        </div>
      </div>

      <ul className="flex shrink-0 flex-wrap gap-1.5 sm:max-w-xs sm:justify-end" aria-label="Turmas">
        {classes.length === 0 ? (
          <li className="text-muted-foreground text-xs">Sem turma</li>
        ) : (
          classes.map((item) => (
            <li
              key={item._id}
              className="border-brand-level/40 text-brand-level rounded-md border border-dashed px-2 py-0.5 text-xs font-semibold"
            >
              {item.name}
            </li>
          ))
        )}
      </ul>

      {actions && <div className="flex shrink-0 gap-1">{actions}</div>}
    </li>
  );
}
