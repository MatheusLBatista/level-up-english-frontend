import { SquareCheckBigIcon, SquareIcon } from "lucide-react";

type SelectAllCardProps = {
  allSelected: boolean;
  onToggle: () => void;
};

export function SelectAllCard({ allSelected, onToggle }: SelectAllCardProps) {
  const Icon = allSelected ? SquareCheckBigIcon : SquareIcon;

  return (
    <li>
      <button
        type="button"
        aria-pressed={allSelected}
        onClick={onToggle}
        className="border-border text-muted-foreground hover:border-primary/60 hover:text-foreground focus-visible:ring-ring/50 text-label flex h-full min-h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-4 font-semibold transition-colors outline-none focus-visible:ring-[3px]"
      >
        <Icon className="size-7" />
        {allSelected ? "Desmarcar todos" : "Selecionar todos"}
      </button>
    </li>
  );
}
