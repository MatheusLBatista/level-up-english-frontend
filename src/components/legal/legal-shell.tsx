import { Gamepad2Icon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LegalLinks } from "@/components/legal/legal-links";
import { LEGAL_UPDATED_AT } from "@/lib/legal";
import { cn } from "@/lib/utils";

type LegalShellProps = {
  title: string;
  /** Uma frase sobre o documento, logo abaixo do título. */
  summary: string;
  /** Botões ao lado do título (ex.: imprimir). */
  actions?: ReactNode;
  children: ReactNode;
};

/**
 * Moldura das páginas públicas /privacidade, /termos e /termo-responsaveis.
 * Não passa pelo AuthGuard: precisa abrir para responsáveis sem conta. Na
 * impressão, cabeçalho, links e botões somem (`print:hidden`).
 */
export function LegalShell({
  title,
  summary,
  actions,
  children,
}: LegalShellProps) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-border border-b print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/login" className="flex items-center gap-2 font-semibold">
            <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
              <Gamepad2Icon className="size-4" />
            </span>
            LevelUp English
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 print:max-w-none print:p-0">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-heading text-title font-semibold">{title}</h1>
            <p className="text-muted-foreground mt-2 text-sm">{summary}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Última atualização: {LEGAL_UPDATED_AT}
            </p>
          </div>
          {actions && <div className="print:hidden">{actions}</div>}
        </div>

        <article className="flex flex-col gap-8">{children}</article>
      </main>

      <footer className="border-border border-t">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
          <p
            role="note"
            className="border-brand-level/40 bg-brand-level/10 flex gap-2 rounded-xl border p-3 text-xs print:border-black print:bg-transparent"
          >
            <TriangleAlertIcon className="text-brand-level mt-0.5 size-4 shrink-0 print:hidden" />
            <span>
              <strong>Texto modelo.</strong> Este documento foi escrito como
              modelo para o projeto LevelUp English e precisa de revisão
              jurídica antes de ser usado por uma escola real.
            </span>
          </p>
          <LegalLinks className="justify-start print:hidden" />
        </div>
      </footer>
    </div>
  );
}

type LegalSectionProps = {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
};

/** Seção numerada pelo próprio título; o texto usa os estilos de `.legal-text`. */
export function LegalSection({
  id,
  title,
  children,
  className,
}: LegalSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "flex scroll-mt-6 break-inside-avoid-page flex-col gap-3",
        className,
      )}
    >
      <h2 className="font-heading text-heading font-semibold">{title}</h2>
      <div className="legal-text">{children}</div>
    </section>
  );
}
