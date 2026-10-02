"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SegmentedFilterProps<T extends string> = {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedFilter<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedFilterProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
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
