"use client";

import {
  CircleHelpIcon,
  Gamepad2Icon,
  TargetIcon,
  Volume2Icon,
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import type { MissionType } from "@/lib/types";
import { cn } from "@/lib/utils";

const options: {
  value: MissionType | null;
  label: string;
  icon: ComponentType<LucideProps>;
}[] = [
  { value: null, label: "Todas", icon: Gamepad2Icon },
  { value: "quiz", label: "Quiz", icon: CircleHelpIcon },
  { value: "vocabulary", label: "Vocabulário", icon: TargetIcon },
  { value: "audio", label: "Áudio", icon: Volume2Icon },
];

type MissionTypeFilterProps = {
  value: MissionType | null;
  onChange: (value: MissionType | null) => void;
};

export function MissionTypeFilter({ value, onChange }: MissionTypeFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar missões por tipo"
      className="border-border/40 bg-card/60 inline-flex flex-wrap gap-1 rounded-2xl border p-1 backdrop-blur-sm"
    >
      {options.map(({ value: option, label, icon: Icon }) => {
        const isActive = option === value;

        return (
          <Button
            key={label}
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
