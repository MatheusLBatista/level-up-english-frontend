import Link from "next/link";
import { legalLinks } from "@/lib/legal";
import { cn } from "@/lib/utils";

type LegalLinksProps = {
  className?: string;
  /** Abre em nova aba: útil dentro de formulários, para não perder o que foi digitado. */
  newTab?: boolean;
};

export function LegalLinks({ className, newTab = false }: LegalLinksProps) {
  return (
    <nav
      aria-label="Documentos legais"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs",
        className,
      )}
    >
      {legalLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="hover:text-foreground underline-offset-4 hover:underline"
          {...(newTab ? { target: "_blank", rel: "noopener" } : {})}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
