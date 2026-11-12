"use client";

import { TrophyIcon } from "lucide-react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useSetClassRankingVisible } from "@/hooks/use-set-class-ranking-visible";
import type { ClassSummary } from "@/lib/types";

/**
 * Interruptor do ranking da turma no Painel. Sem atualização otimista: o
 * switch só muda quando a lista de turmas volta da API com o valor novo.
 */
export function ClassRankingToggle({
  schoolClass,
}: {
  schoolClass: ClassSummary;
}) {
  const mutation = useSetClassRankingVisible();
  // Turmas antigas vêm sem o campo e contam como visível, igual ao backend.
  const visible = schoolClass.class_ranking_visible ?? true;

  return (
    <div className="border-border bg-card flex flex-col gap-2 rounded-xl border px-4 py-3">
      <Field
        orientation="horizontal"
        data-disabled={mutation.isPending || undefined}
      >
        <TrophyIcon className="text-brand-xp mt-0.5 size-4 shrink-0" />
        <FieldContent>
          <FieldLabel htmlFor="class-ranking-visible">
            Ranking da turma visível para os alunos
          </FieldLabel>
          <FieldDescription id="class-ranking-visible-description">
            {visible
              ? `Os alunos de ${schoolClass.name} veem a classificação da turma.`
              : `Oculto para os alunos de ${schoolClass.name}. Você continua vendo em Ranking.`}
          </FieldDescription>
        </FieldContent>
        <Switch
          id="class-ranking-visible"
          aria-describedby="class-ranking-visible-description"
          checked={visible}
          disabled={mutation.isPending}
          onCheckedChange={(next) =>
            mutation.mutate({ classId: schoolClass._id, visible: next })
          }
        />
      </Field>

      {mutation.isError && <FieldError>{mutation.error.message}</FieldError>}
    </div>
  );
}
