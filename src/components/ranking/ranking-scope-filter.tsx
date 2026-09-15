"use client";

import { GlobeIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RankingScope } from "@/lib/types";
import { cn } from "@/lib/utils";

const options: { value: RankingScope; label: string; icon: typeof GlobeIcon }[] = [
  { value: "global", label: "Geral", icon: GlobeIcon },
  { value: "class", label: "Turma", icon: UsersIcon },
];

type RankingScopeFilterProps = {
  value: RankingScope;
  onChange: (value: RankingScope) => void;
};

export function RankingScopeFilter({ value, onChange }: RankingScopeFilterProps) {
  return (
    <div
      role="group"
      aria-label="Escopo do ranking"
      className="border-border/40 bg-card/60 inline-flex gap-1 rounded-2xl border p-1 backdrop-blur-sm"
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
              "rounded-xl text-xs font-semibold tracking-wide uppercase",
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
