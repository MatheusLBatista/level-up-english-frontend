import {
  ArrowUpDownIcon,
  ClipboardCheckIcon,
  SquareCheckBigIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SelectionBarProps = {
  count: number;
  onClear: () => void;
  onApplyAttitude?: () => void;
  onAdjustXp?: () => void;
};

export function SelectionBar({
  count,
  onClear,
  onApplyAttitude,
  onAdjustXp,
}: SelectionBarProps) {
  const hasSelection = count > 0;

  return (
    <div className="border-border/40 bg-card/80 sticky bottom-4 z-10 mt-auto flex flex-col gap-2 rounded-2xl border p-2 shadow-lg backdrop-blur-md sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-2 px-3 py-1">
        <SquareCheckBigIcon className="text-primary size-4 shrink-0" />
        <p className="text-sm font-semibold" aria-live="polite">
          {count === 0
            ? "Nenhum aluno selecionado"
            : count === 1
              ? "1 aluno selecionado"
              : `${count} alunos selecionados`}
        </p>
        {hasSelection && (
          <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={onClear}>
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button
          onClick={onApplyAttitude}
          disabled={!hasSelection || !onApplyAttitude}
          className="bg-brand-xp hover:bg-brand-xp/90 text-xs font-semibold tracking-wide text-white uppercase"
        >
          <ClipboardCheckIcon />
          Aplicar atitude
        </Button>
        <Button
          onClick={onAdjustXp}
          disabled={!hasSelection || !onAdjustXp}
          className="from-brand-mission to-brand-reward bg-linear-to-r text-xs font-semibold tracking-wide text-white uppercase hover:opacity-90"
        >
          <ArrowUpDownIcon />
          Ajustar saldo
        </Button>
      </div>
    </div>
  );
}
