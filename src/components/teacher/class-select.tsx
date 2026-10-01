"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClassSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type ClassSelectProps = {
  classes: ClassSummary[];
  value: string | null;
  onChange: (classId: string) => void;
  isPending?: boolean;
  disabled?: boolean;
  className?: string;
};

export function ClassSelect({
  classes,
  value,
  onChange,
  isPending = false,
  disabled,
  className,
}: ClassSelectProps) {
  return (
    <Select
      value={value ?? undefined}
      onValueChange={onChange}
      disabled={disabled || classes.length === 0}
    >
      <SelectTrigger className={cn("w-full sm:w-56", className)} aria-label="Turma">
        <SelectValue placeholder={isPending ? "Carregando…" : "Sem turmas"} />
      </SelectTrigger>
      <SelectContent>
        {classes.map((item) => (
          <SelectItem key={item._id} value={item._id}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
