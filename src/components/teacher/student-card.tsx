import { TrophyIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/user";
import type { User } from "@/lib/types";

const xpFormatter = new Intl.NumberFormat("pt-BR");

export function StudentCard({ student }: { student: User }) {
  return (
    <li className="border-border/40 bg-card/60 flex flex-col items-center gap-3 rounded-2xl border p-4 text-center backdrop-blur-sm">
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
    </li>
  );
}
