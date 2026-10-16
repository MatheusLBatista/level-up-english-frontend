import { Gamepad2Icon } from "lucide-react";
import { AuthShowcase } from "@/components/auth/auth-showcase";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid flex-1 lg:grid-cols-[1.15fr_1fr]">
      <aside className="bg-banner-gradient relative hidden overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-12 lg:p-12">
        <AuthShowcase />
        <div className="max-w-sm text-center text-white">
          <h2 className="text-2xl font-bold tracking-tight">
            Aprenda inglês jogando.
          </h2>
          <p className="mt-2 text-sm text-white/75">
            Missões, XP e conquistas para você evoluir no idioma junto com a sua
            turma.
          </p>
        </div>
        <p className="absolute inset-x-12 bottom-8 text-center text-xs text-white/60">
          Dica: refazer uma missão pode melhorar sua nota e render mais XP.
        </p>
      </aside>

      <div className="flex flex-col items-center justify-center gap-10 px-4 py-10 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="bg-brand-gradient grid size-11 place-items-center rounded-xl">
            <Gamepad2Icon className="size-6 text-white" />
          </span>
          <span className="grid">
            <span className="text-lg leading-tight font-semibold">
              LevelUp English
            </span>
            <span className="text-muted-foreground text-[10px] font-medium tracking-[0.18em] uppercase">
              English Learning
            </span>
          </span>
        </div>

        {children}
      </div>
    </main>
  );
}
