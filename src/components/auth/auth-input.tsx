import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AuthInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/40 h-10 border-white/40 bg-white/10 px-3 placeholder:text-white/50 dark:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}
