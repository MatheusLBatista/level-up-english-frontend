"use client";

import { Button } from "@/components/ui/button";
import type { ClassStatus } from "@/hooks/use-admin-classes";
import { cn } from "@/lib/utils";

const options: { value: ClassStatus; label: string }[] = [
  { value: "ativas", label: "Ativas" },
  { value: "inativas", label: "Inativas" },
  { value: "todas", label: "Todas" },
];

type ClassStatusFilterProps = {
  value: ClassStatus;
  onChange: (value: ClassStatus) => void;
};

export function ClassStatusFilter({ value, onChange }: ClassStatusFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar turmas por status"
      className="border-border/40 bg-card/60 inline-flex shrink-0 gap-1 rounded-xl border p-1"
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant="ghost"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-lg text-xs font-semibold tracking-wide uppercase",
              isActive &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
