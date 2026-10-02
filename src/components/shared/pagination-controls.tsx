import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Paginated } from "@/lib/types";

type PaginationControlsProps = {
  page: Paginated<unknown>;
  onChange: (page: number) => void;
};

export function PaginationControls({ page, onChange }: PaginationControlsProps) {
  if (page.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="sm"
        disabled={!page.hasPrevPage}
        onClick={() => onChange(page.page - 1)}
      >
        <ChevronLeftIcon />
        Anterior
      </Button>

      <span className="text-muted-foreground text-sm tabular-nums">
        Página {page.page} de {page.totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={!page.hasNextPage}
        onClick={() => onChange(page.page + 1)}
      >
        Próxima
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
