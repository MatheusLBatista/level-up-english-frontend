import { SquareCheckBigIcon, SquareIcon, SquareMinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectAllCardProps = {
  selectedCount: number;
  total: number;
  onToggle: () => void;
};

export function SelectAllCard({
  selectedCount,
  total,
  onToggle,
}: SelectAllCardProps) {
  const allSelected = total > 0 && selectedCount === total;
  const someSelected = selectedCount > 0 && !allSelected;
  const Icon = allSelected
    ? SquareCheckBigIcon
    : someSelected
      ? SquareMinusIcon
      : SquareIcon;

  return (
    <li>
      <button
        type="button"
        aria-pressed={allSelected ? true : someSelected ? "mixed" : false}
        onClick={onToggle}
        className="border-border text-muted-foreground hover:border-primary/60 hover:text-foreground focus-visible:ring-ring/50 text-label flex h-full min-h-12 w-full flex-row items-center justify-center gap-2 rounded-xl border border-dashed p-3 font-semibold transition-colors outline-none focus-visible:ring-[3px] sm:min-h-44 sm:flex-col sm:rounded-2xl sm:p-4"
      >
        <Icon
          className={cn("size-5 sm:size-7", someSelected && "text-primary")}
        />
        {allSelected ? "Desmarcar todos" : "Selecionar todos"}
        {someSelected && (
          <span className="text-foreground tabular-nums">
            {selectedCount} de {total} marcados
          </span>
        )}
      </button>
    </li>
  );
}
