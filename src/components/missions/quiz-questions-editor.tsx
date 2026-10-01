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
import { cn } from "@/lib/utils";
import {
  answerKeys,
  MIN_QUIZ_QUESTIONS,
  type MissionFormInput,
} from "@/schemas/mission";

type QuizQuestionsEditorProps = {
  form: UseFormReturn<MissionFormInput>;
  disabled: boolean;
};

export function QuizQuestionsEditor({
  form,
  disabled,
}: QuizQuestionsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });
  const { errors } = useFormState({ control: form.control, name: "questions" });

  const questionErrors = errors.questions;
  const canRemove = fields.length > MIN_QUIZ_QUESTIONS;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium">Perguntas</p>
        <p className="text-muted-foreground text-xs">
          {fields.length} cadastradas · mínimo {MIN_QUIZ_QUESTIONS}. Marque a
          alternativa correta de cada uma.
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
              className="border-border/40 bg-card/40 flex flex-col gap-3 rounded-xl border p-3"
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
                      : `O quiz precisa de pelo menos ${MIN_QUIZ_QUESTIONS} perguntas`
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
                  placeholder="Ex.: What color is the sky?"
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
        disabled={disabled}
        onClick={() => append(createEmptyQuestion())}
      >
        <PlusIcon />
        Adicionar pergunta
      </Button>
    </div>
  );
}
