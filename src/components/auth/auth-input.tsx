import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AuthInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/40 border-input bg-card placeholder:text-muted-foreground h-10 px-3 dark:border-white/40 dark:bg-white/10 dark:placeholder:text-white/50",
        className,
      )}
      {...props}
    />
  );
}
