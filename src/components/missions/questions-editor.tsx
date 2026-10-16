"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useFormState,
  type UseFormReturn,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createEmptyQuestion } from "@/lib/mission-form";
import type { MissionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  answerKeys,
  questionLimits,
  type MissionFormInput,
} from "@/schemas/mission";

type QuestionsEditorProps = {
  form: UseFormReturn<MissionFormInput>;
  type: MissionType;
  disabled: boolean;
};

export function QuestionsEditor({
  form,
  type,
  disabled,
}: QuestionsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });
  const { errors } = useFormState({ control: form.control, name: "questions" });

  const { min, max } = questionLimits[type];
  const isQuiz = type === "quiz";
  const questionErrors = errors.questions;
  const canRemove = fields.length > min;
  const canAdd = max === null || fields.length < max;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium">
          {isQuiz ? "Perguntas" : "Perguntas de checagem"}
        </p>
        <p className="text-muted-foreground text-xs">
          {isQuiz
            ? `${fields.length} cadastradas · mínimo ${min}. Marque a alternativa correta de cada uma.`
            : `${fields.length} de ${max} · o aluno responde depois de estudar o conteúdo. Marque a alternativa correta.`}
        </p>
      </div>

      <FieldError>
        {questionErrors?.message ?? questionErrors?.root?.message}
      </FieldError>

      <ol className="flex flex-col gap-3">
        {fields.map((item, index) => {
          const itemErrors = questionErrors?.[index];
          const number = index + 1;

          return (
            <li
              key={item.id}
              className="border-border bg-card flex flex-col gap-3 rounded-xl border p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Pergunta {number}
                </span>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Remover pergunta ${number}`}
                  title={
                    canRemove
                      ? "Remover"
                      : `Mantenha pelo menos ${min} ${min === 1 ? "pergunta" : "perguntas"}`
                  }
                  className="hover:text-destructive"
                  disabled={disabled || !canRemove}
                  onClick={() => remove(index)}
                >
                  <Trash2Icon />
                </Button>
              </div>

              <Field data-invalid={Boolean(itemErrors?.question)}>
                <FieldLabel
                  htmlFor={`questions.${index}.question`}
                  className="sr-only"
                >
                  Enunciado da pergunta {number}
                </FieldLabel>
                <Input
                  id={`questions.${index}.question`}
                  placeholder={
                    isQuiz
                      ? "Ex.: What color is the sky?"
                      : "Ex.: What does “apple” mean?"
                  }
                  aria-invalid={Boolean(itemErrors?.question)}
                  disabled={disabled}
                  {...form.register(`questions.${index}.question`)}
                />
                <FieldError errors={[itemErrors?.question]} />
              </Field>

              <Controller
                control={form.control}
                name={`questions.${index}.correct_answer`}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={disabled}
                    aria-label={`Alternativa correta da pergunta ${number}`}
                  >
                    {answerKeys.map((key) => {
                      const optionError = itemErrors?.options?.[key];
                      const isCorrect = field.value === key;

                      return (
                        <Field
                          key={key}
                          data-invalid={Boolean(optionError)}
                          className="gap-1"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem
                              value={key}
                              aria-label={`Marcar ${key.toUpperCase()} como correta`}
                            />
                            <span
                              className={cn(
                                "w-4 text-xs font-semibold uppercase",
                                isCorrect
                                  ? "text-brand-done"
                                  : "text-muted-foreground",
                              )}
                            >
                              {key}
                            </span>
                            <Input
                              aria-label={`Alternativa ${key.toUpperCase()} da pergunta ${number}`}
                              aria-invalid={Boolean(optionError)}
                              placeholder={`Alternativa ${key.toUpperCase()}`}
                              className={cn(
                                isCorrect && "border-brand-done/50",
                              )}
                              disabled={disabled}
                              {...form.register(
                                `questions.${index}.options.${key}`,
                              )}
                            />
                          </div>
                          <FieldError
                            errors={[optionError]}
                            className="pl-12"
                          />
                        </Field>
                      );
                    })}
                  </RadioGroup>
                )}
              />
            </li>
          );
        })}
      </ol>

      <Button
        type="button"
        variant="outline"
        className="border-dashed"
        disabled={disabled || !canAdd}
        title={canAdd ? undefined : `No máximo ${max} perguntas de checagem`}
        onClick={() => append(createEmptyQuestion())}
      >
        <PlusIcon />
        Adicionar pergunta
      </Button>
    </div>
  );
}
