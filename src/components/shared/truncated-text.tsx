"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isTruncated } from "@/lib/dom";

type TruncatedTextProps = {
  children: ReactNode;
  className?: string;
  as?: "p" | "span";
  /** Conteúdo do tooltip; por padrão repete o próprio texto. */
  tooltip?: ReactNode;
};

/**
 * Texto com `truncate`/`line-clamp` que mostra o conteúdo completo num
 * tooltip ao passar o mouse, mas só quando foi realmente cortado.
 * O elemento precisa ser de bloco (ou item de flex) para a medição funcionar.
 */
export function TruncatedText({
  children,
  className,
  as: Comp = "span",
  tooltip,
}: TruncatedTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next && ref.current && !isTruncated(ref.current)) return;
    setOpen(next);
  }

  return (
    <Tooltip open={open} onOpenChange={handleOpenChange}>
      <TooltipTrigger asChild>
        <Comp
          ref={(node: HTMLElement | null) => {
            ref.current = node;
          }}
          className={className}
        >
          {children}
        </Comp>
      </TooltipTrigger>
      <TooltipContent>{tooltip ?? children}</TooltipContent>
    </Tooltip>
  );
}
