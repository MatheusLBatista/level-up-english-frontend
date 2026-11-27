import { Button } from "@/components/ui/button";
import { formatFullDate } from "@/lib/date";

type DraftRestoredNoticeProps = {
  savedAt: string;
  onDiscard: () => void;
  disabled?: boolean;
};

export function DraftRestoredNotice({
  savedAt,
  onDiscard,
  disabled,
}: DraftRestoredNoticeProps) {
  return (
    <div className="border-brand-level/40 bg-brand-level/10 flex flex-col gap-2 rounded-xl border p-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <p>Continuando o rascunho salvo em {formatFullDate(savedAt)}.</p>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="self-end sm:shrink-0 sm:self-auto"
        disabled={disabled}
        onClick={onDiscard}
      >
        Descartar
      </Button>
    </div>
  );
}
