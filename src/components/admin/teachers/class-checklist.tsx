"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { ClassSummary } from "@/lib/types";

type ClassChecklistProps = {
  /** Turmas ativas da escola. */
  classes: ClassSummary[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Professor que está sendo editado (null ao criar). */
  teacherId: string | null;
  disabled?: boolean;
};

export function ClassChecklist({
  classes,
  value,
  onChange,
  teacherId,
  disabled = false,
}: ClassChecklistProps) {
  const selected = new Set(value);

  function toggle(classId: string, checked: boolean) {
    onChange(
      checked ? [...value, classId] : value.filter((id) => id !== classId),
    );
  }

  if (classes.length === 0) {
    return (
      <p className="text-muted-foreground border-border/40 rounded-lg border border-dashed p-3 text-xs">
        Nenhuma turma ativa ainda. Dá para criar em Turmas e atribuir depois.
      </p>
    );
  }

  return (
    <ul className="border-border/40 divide-border/40 max-h-56 divide-y overflow-y-auto rounded-lg border">
      {classes.map((item) => {
        const checkboxId = `class-${item._id}`;
        const isChecked = selected.has(item._id);
        const otherTeacher =
          item.teacher && item.teacher._id !== teacherId ? item.teacher : null;

        return (
          <li key={item._id}>
            <label
              htmlFor={checkboxId}
              className="hover:bg-muted/40 flex cursor-pointer items-center gap-3 px-3 py-2 has-disabled:cursor-not-allowed"
            >
              <Checkbox
                id={checkboxId}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  toggle(item._id, checked === true)
                }
                disabled={disabled}
              />
              <span className="min-w-0 flex-1 truncate text-sm">
                {item.name}
              </span>
              {otherTeacher ? (
                <span
                  className={
                    isChecked
                      ? "text-brand-level shrink-0 text-xs"
                      : "text-muted-foreground shrink-0 text-xs"
                  }
                >
                  {isChecked ? "sai de" : "hoje:"} {otherTeacher.name}
                </span>
              ) : (
                !item.teacher && (
                  <span className="text-muted-foreground shrink-0 text-xs">
                    sem professor
                  </span>
                )
              )}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
