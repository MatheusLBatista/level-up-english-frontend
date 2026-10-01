"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
import { ClassSelect } from "@/components/teacher/class-select";
import { QuizQuestionsEditor } from "@/components/missions/quiz-questions-editor";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { useSaveMission } from "@/hooks/use-save-mission";
import { ApiError } from "@/lib/api";
import { getMissionFormDefaults } from "@/lib/mission-form";
import type { ClassSummary, Mission } from "@/lib/types";
import { cn } from "@/lib/utils";
import { missionFormSchema, type MissionFormInput } from "@/schemas/mission";

const typeOptions = [
  {
    value: "quiz",
    label: "Quiz",
    activeClassName: "bg-brand-xp hover:bg-brand-xp",
  },
  {
    value: "vocabulary",
    label: "Vocabulário",
    activeClassName: "bg-brand-mission hover:bg-brand-mission",
  },
  {
    value: "audio",
    label: "Áudio",
    activeClassName: "bg-brand-reward hover:bg-brand-reward",
  },
] as const;

const serverFields = new Set<string>([
  "title",
  "description",
  "xp_reward",
  "class_id",
  "content",
  "content_url",
  "questions",
]);

const questionFieldPath =
  /^questions\.\d+\.(question|correct_answer|options\.[abcd])$/;

function isFormField(path: string): path is FieldPath<MissionFormInput> {
  return serverFields.has(path) || questionFieldPath.test(path);
}

type MissionFormProps = {
  mission: Mission | null;
  classes: ClassSummary[];
  defaultClassId: string | null;
  mutation: ReturnType<typeof useSaveMission>;
  onSaved: () => void;
};

export function MissionForm({
  mission,
  classes,
  defaultClassId,
  mutation,
  onSaved,
}: MissionFormProps) {
  const isEditing = mission !== null;

  const form = useForm<MissionFormInput>({
    resolver: zodResolver(missionFormSchema),
    defaultValues: getMissionFormDefaults(mission, defaultClassId),
  });

  const type = useWatch({ control: form.control, name: "type" });
  const { errors } = form.formState;
  const hasFieldErrors = Object.keys(errors).length > 0;

  function handleSubmit(values: MissionFormInput) {
    mutation.mutate(
      { missionId: mission?._id ?? null, values },
      {
        onSuccess: onSaved,
        onError: (error) => {
          if (!(error instanceof ApiError)) {
            return;
          }

          for (const item of error.errors) {
            if (item.path && isFormField(item.path)) {
              form.setError(item.path, { message: item.message });
            }
          }
        },
      },
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Editar missão" : "Nova missão"}</DialogTitle>
        <DialogDescription>Crie conteúdos para seus alunos.</DialogDescription>
      </DialogHeader>

      <form
        noValidate
        id="mission-form"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FieldGroup>
          <Field>
            <FieldLabel id="mission-type-label">Tipo de missão</FieldLabel>
            <div
              role="group"
              aria-labelledby="mission-type-label"
              className="border-border/40 bg-card/60 grid grid-cols-3 gap-1 rounded-xl border p-1"
            >
              {typeOptions.map(({ value, label, activeClassName }) => {
                const isActive = type === value;

                return (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-pressed={isActive}
                    disabled={isEditing || mutation.isPending}
                    onClick={() => form.setValue("type", value)}
                    className={cn(
                      "rounded-lg text-xs font-semibold tracking-wide uppercase",
                      isActive &&
                        cn(
                          "text-primary-foreground hover:text-primary-foreground disabled:opacity-100",
                          activeClassName,
                        ),
                    )}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
            {isEditing && (
              <FieldDescription>
                O tipo não pode ser alterado depois que a missão é criada.
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={Boolean(errors.title)}>
            <FieldLabel htmlFor="title">Título</FieldLabel>
            <Input
              id="title"
              placeholder="Ex.: Aprenda as cores em inglês"
              aria-invalid={Boolean(errors.title)}
              disabled={mutation.isPending}
              {...form.register("title")}
            />
            <FieldError errors={[errors.title]} />
          </Field>

          <Field data-invalid={Boolean(errors.description)}>
            <FieldLabel htmlFor="description">Descrição (opcional)</FieldLabel>
            <Textarea
              id="description"
              rows={2}
              placeholder="Descreva o que o aluno vai aprender…"
              aria-invalid={Boolean(errors.description)}
              disabled={mutation.isPending}
              {...form.register("description")}
            />
            <FieldError errors={[errors.description]} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.xp_reward)}>
              <FieldLabel htmlFor="xp_reward">XP de recompensa</FieldLabel>
              <Input
                id="xp_reward"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                className="tabular-nums"
                aria-invalid={Boolean(errors.xp_reward)}
                disabled={mutation.isPending}
                {...form.register("xp_reward", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.xp_reward]} />
            </Field>

            <Field data-invalid={Boolean(errors.class_id)}>
              <FieldLabel>Turma</FieldLabel>
              <Controller
                control={form.control}
                name="class_id"
                render={({ field }) => (
                  <ClassSelect
                    classes={classes}
                    value={field.value || null}
                    onChange={field.onChange}
                    className="sm:w-full"
                    disabled={mutation.isPending}
                  />
                )}
              />
              <FieldError errors={[errors.class_id]} />
            </Field>
          </div>

          {type === "vocabulary" && (
            <Field data-invalid={Boolean(errors.content)}>
              <FieldLabel htmlFor="content">Conteúdo</FieldLabel>
              <Textarea
                id="content"
                rows={6}
                placeholder="Palavras, frases e exemplos que o aluno vai estudar…"
                aria-invalid={Boolean(errors.content)}
                disabled={mutation.isPending}
                {...form.register("content")}
              />
              <FieldError errors={[errors.content]} />
            </Field>
          )}

          {type === "audio" && (
            <>
              <Field data-invalid={Boolean(errors.content_url)}>
                <FieldLabel htmlFor="content_url">
                  Link do áudio ou vídeo
                </FieldLabel>
                <Input
                  id="content_url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=…"
                  aria-invalid={Boolean(errors.content_url)}
                  disabled={mutation.isPending}
                  {...form.register("content_url")}
                />
                <FieldDescription>
                  Links do YouTube viram um player de vídeo; outros links tocam
                  como áudio.
                </FieldDescription>
                <FieldError errors={[errors.content_url]} />
              </Field>

              <Field data-invalid={Boolean(errors.content)}>
                <FieldLabel htmlFor="content">
                  Texto de apoio (opcional)
                </FieldLabel>
                <Textarea
                  id="content"
                  rows={4}
                  placeholder="Transcrição, vocabulário ou instruções…"
                  aria-invalid={Boolean(errors.content)}
                  disabled={mutation.isPending}
                  {...form.register("content")}
                />
                <FieldError errors={[errors.content]} />
              </Field>
            </>
          )}

          {type === "quiz" && (
            <QuizQuestionsEditor form={form} disabled={mutation.isPending} />
          )}

          {isEditing && (
            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Switch
                    id="active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={mutation.isPending}
                  />
                  <FieldLabel htmlFor="active">
                    Missão ativa (visível para os alunos)
                  </FieldLabel>
                </Field>
              )}
            />
          )}

          {mutation.isError && !hasFieldErrors && (
            <FieldError>{mutation.error.message}</FieldError>
          )}
        </FieldGroup>
      </form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" disabled={mutation.isPending}>
            Cancelar
          </Button>
        </DialogClose>

        <Button
          type="submit"
          form="mission-form"
          className="bg-brand-gradient"
          disabled={mutation.isPending}
        >
          {mutation.isPending && <Loader2Icon className="animate-spin" />}
          {mutation.isPending
            ? "Salvando…"
            : isEditing
              ? "Salvar alterações"
              : "Criar missão"}
        </Button>
      </DialogFooter>
    </>
  );
}
