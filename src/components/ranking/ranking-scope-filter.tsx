"use client";

import { GlobeIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RankingScope } from "@/lib/types";
import { cn } from "@/lib/utils";

const options: {
  value: RankingScope;
  label: string;
  icon: typeof GlobeIcon;
}[] = [
  { value: "class", label: "Turma", icon: UsersIcon },
  { value: "global", label: "Geral", icon: GlobeIcon },
];

type RankingScopeFilterProps = {
  value: RankingScope;
  onChange: (value: RankingScope) => void;
};

export function RankingScopeFilter({
  value,
  onChange,
}: RankingScopeFilterProps) {
  return (
    <div
      role="group"
      aria-label="Escopo do ranking"
      className="border-border bg-card inline-flex gap-1 rounded-2xl border p-1"
    >
      {options.map(({ value: option, label, icon: Icon }) => {
        const isActive = option === value;

        return (
          <Button
            key={option}
            type="button"
            size="sm"
            variant="ghost"
            aria-pressed={isActive}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-xl text-xs font-semibold",
              isActive &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
          >
            <Icon />
            {label}
          </Button>
        );
      })}
    </div>
  );
}
