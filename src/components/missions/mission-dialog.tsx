"use client";

import {
  CheckCircle2Icon,
  GiftIcon,
  PartyPopperIcon,
  PlayIcon,
  RotateCcwIcon,
} from "lucide-react";
import { useState } from "react";
import { MissionCard } from "@/components/missions/mission-card";
import { MissionMedia } from "@/components/missions/mission-media";
import { MissionQuiz } from "@/components/missions/mission-quiz";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSubmitMissionProgress } from "@/hooks/use-submit-mission-progression";
import { canRetryMission, getMissionStatus } from "@/lib/missions";
import type { Mission, MissionProgressEntry, QuizAnswer } from "@/lib/types";

type MissionDialogProps = {
  mission: Mission;
  progress?: MissionProgressEntry;
  withAction?: boolean;
};

export function MissionDialog({
  mission,
  progress,
  withAction = false,
}: MissionDialogProps) {
  const [answers, setAnswers] = useState<(QuizAnswer | undefined)[]>([]);
  const mutation = useSubmitMissionProgress(mission._id);

  const questions = mission.questions ?? [];
  const isQuiz = mission.type === "quiz";
  // Vocabulário e áudio antigos não têm perguntas: concluem com um clique.
  const hasQuestions = questions.length > 0;
  const withoutQuestions = isQuiz && !hasQuestions;
  const allAnswered =
    questions.length > 0 && answers.filter(Boolean).length === questions.length;
  const result = mutation.data;

  const status = getMissionStatus(progress);
  const isRetry = canRetryMission(mission, progress);
  const canRetryNow =
    hasQuestions && result !== undefined && result.score < 100;

  const actionLabel = isRetry
    ? "Tentar de novo"
    : status === "in-progress"
      ? "Continuar"
      : "Jogar agora";

  const action = !withAction ? null : status === "done" && !isRetry ? (
    <Button variant="secondary" className="text-brand-done w-full" disabled>
      <CheckCircle2Icon />
      Concluído
    </Button>
  ) : (
    <DialogTrigger asChild>
      <Button variant={isRetry ? "outline" : "default"} className="w-full">
        {isRetry ? <RotateCcwIcon /> : <PlayIcon />}
        {actionLabel}
      </Button>
    </DialogTrigger>
  );

  function resetAttempt() {
    mutation.reset();
    setAnswers([]);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      resetAttempt();
    }
  }

  function handleAnswer(index: number, answer: QuizAnswer) {
    setAnswers((current) => {
      const next = [...current];
      next[index] = answer;
      return next;
    });
  }

  function handleSubmit() {
    mutation.mutate(
      hasQuestions
        ? { done: true, answers: answers as QuizAnswer[] }
        : { done: true },
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      {withAction ? (
        <MissionCard mission={mission} progress={progress} action={action} />
      ) : (
        <DialogTrigger asChild>
          <button type="button" className="rounded-xl text-left">
            <MissionCard mission={mission} progress={progress} />
          </button>
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[85vh] gap-6 overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mission.title}</DialogTitle>
          <DialogDescription>
            {mission.description ?? "Conclua a missão para ganhar XP."}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="border-brand-done/40 bg-brand-done/10 flex flex-col items-center gap-2 rounded-xl border p-8 text-center">
            <PartyPopperIcon className="text-brand-done size-8" />
            <p className="text-lg font-semibold">
              {result.xp_earned > 0
                ? `+${result.xp_earned} XP`
                : "Missão registrada"}
            </p>
            <p className="text-muted-foreground text-sm">
              {result.total_questions
                ? `Você acertou ${result.correct_answers} de ${result.total_questions} (${result.score}%).`
                : "Progresso salvo."}
            </p>
            {result.best_score > result.score && (
              <p className="text-muted-foreground text-sm">
                Sua melhor nota nesta missão continua {result.best_score}%.
              </p>
            )}
            {result.already_rewarded && (
              <p className="text-muted-foreground text-sm">
                {result.xp_earned > 0
                  ? `Você superou sua melhor tentativa, e só a diferença entrou. Total nesta missão: ${result.credited_so_far} de ${mission.xp_reward} XP.`
                  : `Nenhum XP novo: sua melhor tentativa já rendeu ${result.credited_so_far} de ${mission.xp_reward} XP.`}
              </p>
            )}
            {result.progression?.leveled_up && (
              <p className="text-brand-level text-sm font-semibold">
                Você subiu para o nível {result.progression.level}!
              </p>
            )}
          </div>
        ) : (
          <>
            {!isQuiz && <MissionMedia mission={mission} />}

            {withoutQuestions ? (
              <p className="text-muted-foreground border-border rounded-xl border border-dashed p-8 text-center text-sm">
                Esta missão ainda não tem questões cadastradas. Fale com seu
                professor.
              </p>
            ) : (
              hasQuestions && (
                <section className="flex flex-col gap-3">
                  {!isQuiz && (
                    <div>
                      <h3 className="text-sm font-semibold">
                        Responda para concluir
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        Use o conteúdo acima para responder.
                      </p>
                    </div>
                  )}
                  <MissionQuiz
                    questions={questions}
                    answers={answers}
                    disabled={mutation.isPending}
                    onAnswer={handleAnswer}
                  />
                </section>
              )
            )}

            <div className="border-brand-xp/30 bg-brand-xp/10 flex items-center gap-3 rounded-xl border p-4">
              <span className="bg-brand-xp/15 grid size-10 shrink-0 place-items-center rounded-xl">
                <GiftIcon className="text-brand-xp size-5" />
              </span>
              <div>
                <p className="text-brand-xp text-sm font-semibold">
                  Recompensa ao finalizar
                </p>
                <p className="text-muted-foreground text-sm">
                  {mission.xp_reward} XP
                  {hasQuestions && " — proporcional aos acertos"}
                </p>
                {isRetry && progress && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Você já ganhou {progress.xp_earned} XP aqui. Nesta
                    tentativa, só a diferença dos novos acertos conta.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {mutation.isError && (
          <p className="border-destructive/40 bg-destructive/10 rounded-xl border p-3 text-sm">
            {mutation.error.message}
          </p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{result ? "Voltar" : "Fechar"}</Button>
          </DialogClose>

          {canRetryNow && (
            <Button onClick={resetAttempt}>
              <RotateCcwIcon />
              Tentar de novo
            </Button>
          )}

          {!result && (
            <Button
              disabled={
                mutation.isPending ||
                withoutQuestions ||
                (hasQuestions && !allAnswered)
              }
              onClick={handleSubmit}
            >
              <CheckCircle2Icon />
              {mutation.isPending ? "Enviando..." : "Concluir e ganhar pontos"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
