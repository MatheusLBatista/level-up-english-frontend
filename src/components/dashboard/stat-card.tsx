import type { LucideProps } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: ComponentType<LucideProps>;
  label: string;
  value: ReactNode;
  accentClassName?: string;
  children?: ReactNode;
};

export function StatCard({
  icon: Icon,
  label,
  value,
  accentClassName,
  children,
}: StatCardProps) {
  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
      <CardContent className="flex flex-col gap-3">
        <Icon className={cn("size-6", accentClassName)} />

        <div>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            {label}
          </p>
        </div>

        {children}
      </CardContent>
    </Card>
  );
}
