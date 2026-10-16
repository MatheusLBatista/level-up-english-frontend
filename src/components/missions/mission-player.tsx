"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MissionMedia } from "@/components/missions/mission-media";
import { MissionResult } from "@/components/missions/mission-result";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMissionById } from "@/hooks/use-mission";
import { useSubmitMissionProgress } from "@/hooks/use-submit-mission-progression";
import { ApiError } from "@/lib/api";
import {
  clearMissionDraft,
  readMissionDraft,
  saveMissionDraft,
} from "@/lib/mission-draft";
import { canRetryMission, missionTypeLabels } from "@/lib/missions";
import type {
  LevelProgress,
  Mission,
  MissionProgressEntry,
  QuizAnswer,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const OPTION_KEYS: QuizAnswer[] = ["a", "b", "c", "d"];

type Step = "study" | "questions" | "result";

export type LevelSnapshot = {
  level: number;
  progress: LevelProgress;
};

export function MissionPlayer({ missionId }: { missionId: string }) {
  const missionQuery = useMissionById(missionId);
  const userQuery = useCurrentUser();

  if (missionQuery.isError) {
    const status =
      missionQuery.error instanceof ApiError ? missionQuery.error.status : 0;

    return (
      <MissionUnavailable
        message={
          status === 403
            ? "Esta missão é de outra turma."
            : status === 404 || status === 400
              ? "Não encontramos esta missão. Ela pode ter sido desativada."
              : "Não foi possível carregar a missão. Verifique sua conexão."
        }
        onRetry={
          status >= 500 || status === 0
            ? () => void missionQuery.refetch()
            : undefined
        }
      />
    );
  }

  if (!missionQuery.data || !userQuery.data) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  const progress = userQuery.data.mission_progress.find(
    (entry) => entry.mission_id === missionId,
  );

  return (
    <MissionFlow
      key={missionQuery.data._id}
      mission={missionQuery.data}
      progress={progress}
      level={{ level: userQuery.data.level, progress: userQuery.data.progress }}
    />
  );
}

function MissionUnavailable({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="border-border bg-card mx-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-lg border p-10 text-center">
      <p className="text-base">{message}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Tentar de novo
          </Button>
        )}
        <Button asChild>
          <Link href="/missoes">Voltar às missões</Link>
        </Button>
      </div>
    </div>
  );
}

type MissionFlowProps = {
  mission: Mission;
  progress?: MissionProgressEntry;
  level: LevelSnapshot;
};

function MissionFlow({ mission, progress, level }: MissionFlowProps) {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?._id ?? "";
  const mutation = useSubmitMissionProgress(mission._id);

  const questions = mission.questions ?? [];
  const hasQuestions = questions.length > 0;
  const hasMaterial = Boolean(mission.content || mission.content_url);
  const isQuiz = mission.type === "quiz";
  const finishedForGood =
    progress?.done === true && !canRetryMission(mission, progress);

  const [draft] = useState(() => readMissionDraft(userId, mission._id));
  const [answers, setAnswers] = useState<(QuizAnswer | null)[]>(() =>
    questions.map((_, index) => draft?.answers[index] ?? null),
  );
  const [current, setCurrent] = useState(() =>
    Math.min(draft?.question ?? 0, Math.max(questions.length - 1, 0)),
  );
  const [step, setStep] = useState<Step>(() =>
    draft?.answers.some(Boolean) || !hasMaterial ? "questions" : "study",
  );
  const [levelBefore, setLevelBefore] = useState(level);
  const [confirmExit, setConfirmExit] = useState(false);

  const answeredCount = answers.filter(Boolean).length;
  const dirty = step !== "result" && answeredCount > 0;
  const missing = answers.flatMap((answer, index) =>
    answer ? [] : [index + 1],
  );

  useEffect(() => {
    if (!userId || step === "result") {
      return;
    }

    if (answeredCount === 0) {
      clearMissionDraft(userId, mission._id);
      return;
    }

    saveMissionDraft(userId, mission._id, { answers, question: current });
  }, [userId, mission._id, answers, current, answeredCount, step]);

  useEffect(() => {
    if (!dirty) {
      return;
    }

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function choose(answer: QuizAnswer) {
    setAnswers((list) =>
      list.map((value, index) => (index === current ? answer : value)),
    );
  }

  function submit() {
    setLevelBefore(level);
    mutation.mutate(
      hasQuestions
        ? { done: true, answers: answers as QuizAnswer[] }
        : { done: true },
      {
        onSuccess: () => {
          clearMissionDraft(userId, mission._id);
          setStep("result");
        },
      },
    );
  }

  function restart() {
    mutation.reset();
    setAnswers(questions.map(() => null));
    setCurrent(0);
    setStep(hasMaterial ? "study" : "questions");
  }

  function leave() {
    if (dirty) {
      setConfirmExit(true);
      return;
    }

    router.push("/missoes");
  }

  useEffect(() => {
    if (step !== "questions") {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest("input:not([type=radio]), textarea, [role=dialog]")) {
        return;
      }

      const key = event.key.toLowerCase();
      const byNumber = ["1", "2", "3", "4"].indexOf(key);
      const option =
        byNumber >= 0
          ? OPTION_KEYS[byNumber]
          : OPTION_KEYS.find((k) => k === key);

      if (option) {
        event.preventDefault();
        setAnswers((list) =>
          list.map((value, index) => (index === current ? option : value)),
        );
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, current]);

  const result = mutation.data;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6">
      <header className="flex flex-col gap-3">
        <button
          type="button"
          onClick={leave}
          className="text-muted-foreground hover:text-foreground text-body -ml-2 inline-flex min-h-11 items-center gap-2 self-start rounded-md px-2"
        >
          <ArrowLeftIcon className="size-4" />
          Missões
        </button>

        <div>
          <p className="text-muted-foreground text-body">
            {missionTypeLabels[mission.type]}
            {mission.createdBy && ` · ${mission.createdBy.name}`}
          </p>
          <h1 className="font-english text-title font-semibold">
            {mission.title}
          </h1>
        </div>

        {step === "questions" && hasQuestions && (
          <QuestionTrack
            answers={answers}
            current={current}
            onJump={setCurrent}
          />
        )}
      </header>

      {step === "result" && result ? (
        <MissionResult
          mission={mission}
          result={result}
          levelBefore={levelBefore}
          onRetry={hasQuestions && result.score < 100 ? restart : undefined}
        />
      ) : finishedForGood ? (
        <section className="bg-notebook-page border-border flex flex-col gap-4 rounded-lg border py-8 pr-6 pl-14">
          <p className="font-heading text-heading font-semibold">
            Missão concluída
          </p>
          <p className="text-muted-foreground text-base">
            {hasQuestions
              ? `Você já tirou nota máxima aqui e ganhou ${progress?.xp_earned ?? 0} XP.`
              : `Você já concluiu esta missão e ganhou ${progress?.xp_earned ?? 0} XP.`}
          </p>
          <Button asChild className="self-start">
            <Link href="/missoes">Voltar às missões</Link>
          </Button>
        </section>
      ) : step === "study" ? (
        <StudyStep
          mission={mission}
          action={
            hasQuestions ? (
              <Button
                size="lg"
                className="h-12 w-full sm:w-auto"
                onClick={() => setStep("questions")}
              >
                Começar as perguntas
                <ArrowRightIcon />
              </Button>
            ) : isQuiz ? (
              <p className="text-muted-foreground text-base">
                Esta missão ainda não tem questões cadastradas. Fale com seu
                professor.
              </p>
            ) : (
              <Button
                size="lg"
                className="h-12 w-full sm:w-auto"
                disabled={mutation.isPending}
                onClick={submit}
              >
                {mutation.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <CheckIcon />
                )}
                {mutation.isPending ? "Entregando…" : "Concluir missão"}
              </Button>
            )
          }
        />
      ) : hasQuestions ? (
        <QuestionStep
          index={current}
          total={questions.length}
          question={questions[current]}
          answer={answers[current]}
          onChoose={choose}
        />
      ) : (
        <section className="border-border bg-card rounded-lg border p-8 text-center">
          <p className="text-muted-foreground text-base">
            Esta missão ainda não tem questões cadastradas. Fale com seu
            professor.
          </p>
        </section>
      )}

      {mutation.isError && (
        <p
          role="alert"
          className="border-destructive/50 bg-destructive/10 text-body rounded-lg border p-3"
        >
          {mutation.error.message} Suas respostas continuam aqui.
        </p>
      )}

      {step === "questions" && hasQuestions && !finishedForGood && (
        <footer className="bg-background border-border sticky bottom-0 -mx-4 mt-auto flex flex-col gap-3 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6">
          {current === questions.length - 1 && missing.length > 0 && (
            <p className="text-muted-foreground text-body">
              {missing.length === 1
                ? "Falta a questão "
                : "Faltam as questões "}
              {missing.map((number, index) => (
                <span key={number}>
                  {index > 0 && (index === missing.length - 1 ? " e " : ", ")}
                  <button
                    type="button"
                    onClick={() => setCurrent(number - 1)}
                    className="text-foreground font-semibold underline underline-offset-4"
                  >
                    {number}
                  </button>
                </span>
              ))}
              .
            </p>
          )}

          <div className="flex items-center gap-2">
            {hasMaterial && (
              <Button
                variant="ghost"
                size="icon"
                className="size-12"
                aria-label="Rever o material"
                onClick={() => setStep("study")}
              >
                <BookOpenIcon />
              </Button>
            )}
            <Button
              variant="outline"
              className="h-12 flex-1 sm:flex-none"
              disabled={current === 0}
              onClick={() => setCurrent((index) => index - 1)}
            >
              <ArrowLeftIcon />
              Anterior
            </Button>
            {current < questions.length - 1 ? (
              <Button
                className="h-12 flex-1 sm:ml-auto sm:flex-none"
                onClick={() => setCurrent((index) => index + 1)}
              >
                Próxima
                <ArrowRightIcon />
              </Button>
            ) : (
              <Button
                className="h-12 flex-1 sm:ml-auto sm:flex-none"
                disabled={missing.length > 0 || mutation.isPending}
                onClick={submit}
              >
                {mutation.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <CheckIcon />
                )}
                {mutation.isPending ? "Entregando…" : "Entregar"}
              </Button>
            )}
          </div>
        </footer>
      )}

      <AlertDialog open={confirmExit} onOpenChange={setConfirmExit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da missão?</AlertDialogTitle>
            <AlertDialogDescription>
              Você respondeu {answeredCount} de {questions.length}. As respostas
              ficam guardadas neste aparelho para você continuar depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar a missão</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/missoes")}>
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StudyStep({
  mission,
  action,
}: {
  mission: Mission;
  action: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="bg-notebook-page border-border flex flex-col gap-8 rounded-lg border py-8 pr-6 pl-14">
        <div>
          <h2 className="font-heading text-heading leading-8 font-semibold">
            Estude antes de responder
          </h2>
          {mission.description && (
            <p className="text-muted-foreground text-base leading-8">
              {mission.description}
            </p>
          )}
        </div>
        <MissionMedia mission={mission} />
      </div>
      {action}
    </section>
  );
}

function QuestionTrack({
  answers,
  current,
  onJump,
}: {
  answers: (QuizAnswer | null)[];
  current: number;
  onJump: (index: number) => void;
}) {
  return (
    <nav aria-label="Questões" className="flex flex-col gap-2">
      <p className="text-muted-foreground text-body tabular-nums">
        Questão {current + 1} de {answers.length}
      </p>
      <ol className="flex gap-1.5">
        {answers.map((answer, index) => (
          <li key={index} className="flex-1">
            <button
              type="button"
              onClick={() => onJump(index)}
              aria-current={index === current ? "step" : undefined}
              aria-label={`Questão ${index + 1}${answer ? ", respondida" : ""}`}
              className="group flex h-6 w-full items-center pointer-coarse:h-11"
            >
              <span
                className={cn(
                  "h-1.5 w-full rounded-full transition-colors",
                  index === current
                    ? "bg-primary"
                    : answer
                      ? "bg-primary/45"
                      : "bg-muted group-hover:bg-accent",
                )}
              />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function QuestionStep({
  index,
  total,
  question,
  answer,
  onChoose,
}: {
  index: number;
  total: number;
  question: NonNullable<Mission["questions"]>[number];
  answer: QuizAnswer | null;
  onChoose: (answer: QuizAnswer) => void;
}) {
  const name = `question-${index}`;

  return (
    <fieldset className="flex flex-col gap-5" aria-describedby={`${name}-hint`}>
      <legend className="font-english text-heading mb-5 font-semibold">
        {question.question}
      </legend>

      <div className="flex flex-col gap-3">
        {OPTION_KEYS.map((key, position) => {
          const selected = answer === key;

          return (
            <label
              key={key}
              className={cn(
                "has-focus-visible:ring-ring/60 flex min-h-13 cursor-pointer items-center gap-4 rounded-lg border px-4 py-3 transition-colors has-focus-visible:ring-3",
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:bg-accent",
              )}
            >
              <input
                type="radio"
                name={name}
                value={key}
                checked={selected}
                onChange={() => onChoose(key)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "text-body grid size-8 shrink-0 place-items-center rounded-md border font-semibold uppercase transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {selected ? <CheckIcon className="size-4" /> : key}
              </span>
              <span className="font-english text-base">
                {question.options[key]}
              </span>
              <span className="sr-only">
                {`, alternativa ${position + 1} de 4`}
              </span>
            </label>
          );
        })}
      </div>

      <p id={`${name}-hint`} className="text-muted-foreground text-label">
        Questão {index + 1} de {total}. Atalho: teclas 1 a 4 ou A a D.
      </p>
    </fieldset>
  );
}
