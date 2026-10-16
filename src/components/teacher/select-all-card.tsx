import { SquareCheckBigIcon, SquareIcon, SquareMinusIcon } from "lucide-react";

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
        className="border-border text-muted-foreground hover:border-primary/60 hover:text-foreground focus-visible:ring-ring/50 text-label flex h-full min-h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-4 font-semibold transition-colors outline-none focus-visible:ring-[3px]"
      >
        <Icon className={someSelected ? "text-primary size-7" : "size-7"} />
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
