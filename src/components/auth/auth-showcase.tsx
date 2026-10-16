import {
  CheckIcon,
  MessageCircleIcon,
  SparklesIcon,
  TrophyIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
  { key: "A", text: "go", correct: false },
  { key: "B", text: "went", correct: true },
  { key: "C", text: "gone", correct: false },
];

function Bubble({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute z-10 flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-violet-900 shadow-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AuthShowcase() {
  return (
    <div aria-hidden className="relative w-full max-w-md px-10 py-16">
      <Bubble className="top-2 left-0 -rotate-6 rounded-bl-sm">
        <MessageCircleIcon className="size-4 text-violet-500" />
        Hello!
      </Bubble>
      <Bubble className="top-[42%] -right-2 rotate-3 rounded-bl-sm">
        How are you?
      </Bubble>
      <Bubble className="-bottom-1 left-2 rotate-2 rounded-tl-sm">
        Let&apos;s level up!
      </Bubble>

      <div className="bg-card/95 text-card-foreground relative flex flex-col gap-4 rounded-2xl p-5 shadow-2xl ring-1 ring-white/10">
        <div className="flex items-center justify-between">
          <span className="bg-brand-mission/15 text-brand-mission rounded-full px-2.5 py-1 text-xs font-semibold">
            Missão · Quiz
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">
            2 de 5
          </span>
        </div>

        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Simple Past
          </p>
          <p className="mt-1 text-lg font-semibold">
            Yesterday I ____ to school.
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {options.map(({ key, text, correct }) => (
            <li
              key={key}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm",
                correct
                  ? "border-brand-done/60 bg-brand-done/15 font-semibold"
                  : "border-border/40 bg-background/40",
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full text-xs font-semibold",
                  correct
                    ? "bg-brand-done text-black"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {correct ? <CheckIcon className="size-3.5" /> : key}
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-brand-level font-semibold">Nível 4</span>
            <span className="text-muted-foreground tabular-nums">
              320 / 400 XP
            </span>
          </div>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div className="bg-brand-gradient h-full w-4/5 rounded-full" />
          </div>
        </div>

        <span className="bg-brand-xp absolute -top-4 -right-4 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold text-black shadow-lg">
          <SparklesIcon className="size-4" />
          +50 XP
        </span>

        <div className="bg-card absolute -right-8 -bottom-7 flex items-center gap-2 rounded-xl px-3 py-2 shadow-xl ring-1 ring-white/10">
          <span className="bg-brand-level/15 grid size-8 place-items-center rounded-lg">
            <TrophyIcon className="text-brand-level size-4" />
          </span>
          <div className="leading-tight">
            <p className="text-[10px] tracking-wider text-white/60 uppercase">
              Conquista
            </p>
            <p className="text-xs font-semibold">Nota máxima</p>
          </div>
        </div>
      </div>
    </div>
  );
}
