import { Gamepad2Icon } from "lucide-react";
import { AuthShowcase } from "@/components/auth/auth-showcase";
import { cn } from "@/lib/utils";

function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="bg-primary text-primary-foreground grid size-11 place-items-center rounded-xl">
        <Gamepad2Icon className="size-6" />
      </span>
      <span className="grid">
        <span className="text-lg leading-tight font-semibold">
          LevelUp English
        </span>
        <span className="text-muted-foreground text-label font-medium">
          English Learning
        </span>
      </span>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid flex-1 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr]">
      <aside className="bg-notebook border-border relative hidden overflow-hidden border-r md:flex md:flex-col md:items-center md:justify-center md:gap-12 md:px-8 md:py-28 lg:px-12">
        <BrandLogo className="absolute top-8 left-8 lg:left-12" />
        <AuthShowcase />
        <div className="max-w-sm text-center">
          <h2 className="font-heading text-heading font-semibold">
            Pratique seu inglês jogando.
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Missões, XP e conquistas para você evoluir no idioma junto com a sua
            turma.
          </p>
        </div>
        <p className="text-muted-foreground absolute inset-x-8 bottom-8 text-center text-xs lg:inset-x-12">
          Dica: refazer uma missão pode melhorar sua nota e render mais XP.
        </p>
      </aside>

      <div className="flex flex-col items-center justify-center gap-10 px-4 py-10 sm:px-6">
        <BrandLogo className="md:hidden" />
        {children}
      </div>
    </main>
  );
}
