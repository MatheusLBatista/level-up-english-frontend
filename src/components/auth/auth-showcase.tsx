import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
  { key: "A", text: "go", correct: false },
  { key: "B", text: "went", correct: true },
  { key: "C", text: "gone", correct: false },
];

export function AuthShowcase() {
  return (
    <div
      aria-hidden
      className="bg-notebook-page border-border relative flex w-full max-w-md flex-col gap-5 rounded-lg border py-8 pr-6 pl-14 shadow-[0_24px_48px_-24px_oklch(0.1_0.04_290/0.8)]"
    >
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span className="text-brand-mission font-semibold">Missão · Quiz</span>
        <span className="tabular-nums">2 de 5</span>
      </div>

      <div>
        <p className="text-muted-foreground text-sm">Simple Past</p>
        <p className="font-english text-heading mt-1 font-semibold">
          Yesterday I ____ to school.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {options.map(({ key, text, correct }) => (
          <li
            key={key}
            className={cn(
              "font-english relative flex items-center gap-3 rounded-md border px-3 py-2 text-base",
              correct
                ? "border-brand-done/60 bg-brand-done/10 font-semibold"
                : "border-border",
            )}
          >
            {correct && (
              <CheckIcon
                strokeWidth={3}
                className="text-brand-done absolute top-1/2 -left-11 size-5 -translate-y-1/2"
              />
            )}
            <span className="text-muted-foreground w-4 text-xs font-semibold">
              {key}
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
          <div className="bg-brand-xp h-full w-4/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}
