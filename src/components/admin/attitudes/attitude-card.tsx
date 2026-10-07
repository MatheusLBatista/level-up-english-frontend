import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { formatXpDelta, getAttitudeXp } from "@/lib/attitudes";
import type { Attitude } from "@/lib/types";
import { cn } from "@/lib/utils";

type AttitudeCardProps = {
  attitude: Attitude;
  actions?: ReactNode;
};

export function AttitudeCard({ attitude, actions }: AttitudeCardProps) {
  const positive = attitude.type === "positive";

  return (
    <li
      className={cn(
        "border-border/40 bg-card/60 flex items-center gap-4 rounded-2xl border p-4 backdrop-blur-sm",
        !attitude.active && "opacity-70",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-3.5 shrink-0 rounded-full ring-4",
          positive
            ? "bg-brand-done ring-brand-done/20"
            : "bg-destructive ring-destructive/20",
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold">{attitude.name}</p>
          {!attitude.active && (
            <Badge
              variant="outline"
              className="border-destructive/40 text-destructive text-[10px] tracking-wider uppercase"
            >
              Desativada
            </Badge>
          )}
        </div>
        <p
          className={cn(
            "text-xs font-semibold tabular-nums",
            positive ? "text-brand-done" : "text-destructive",
          )}
        >
          {formatXpDelta(getAttitudeXp(attitude))}
        </p>
        {attitude.description && (
          <p className="text-muted-foreground truncate text-xs">
            {attitude.description}
          </p>
        )}
      </div>

      {actions && <div className="flex shrink-0 gap-1">{actions}</div>}
    </li>
  );
}
