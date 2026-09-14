"use client";

import { CheckCircle2Icon, GiftIcon, PartyPopperIcon } from "lucide-react";
import { useState } from "react";
import { MissionCard } from "@/components/dashboard/mission-card";
import { MissionMedia } from "@/components/dashboard/mission-media";
import { MissionQuiz } from "@/components/dashboard/mission-quiz";
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
import type { Mission, QuizAnswer } from "@/lib/types";

type MissionDialogProps = {
  mission: Mission;
  inProgress: boolean;
};

export function MissionDialog({ mission, inProgress }: MissionDialogProps) {
  const [answers, setAnswers] = useState<(QuizAnswer | undefined)[]>([]);
  const mutation = useSubmitMissionProgress(mission._id);

  const questions = mission.questions ?? [];
  const isQuiz = mission.type === "quiz";
  const withoutQuestions = isQuiz && questions.length === 0;
  const allAnswered =
    questions.length > 0 && answers.filter(Boolean).length === questions.length;
  const result = mutation.data;

  function handleOpenChange(open: boolean) {
    if (!open) {
      // Reabrir a missão tem que começar limpo: sem resultado nem respostas
      // da tentativa anterior.
      mutation.reset();
      setAnswers([]);
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
      isQuiz
        ? { done: true, answers: answers as QuizAnswer[] }
        : // Vocabulary/audio não têm o que corrigir: o aluno declara que
          // terminou e leva o XP cheio.
          { done: true, score: 100 },
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="rounded-xl text-left">
          <MissionCard mission={mission} inProgress={inProgress} />
        </button>
      </DialogTrigger>

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
              {result.already_rewarded &&
                result.xp_earned === 0 &&
                " O XP desta missão já tinha sido creditado."}
            </p>
            {result.progression?.leveled_up && (
              <p className="text-brand-level text-sm font-semibold">
                Você subiu para o nível {result.progression.level}!
              </p>
            )}
          </div>
        ) : (
          <>
            {isQuiz ? (
              withoutQuestions ? (
                <p className="text-muted-foreground border-border/40 rounded-xl border border-dashed p-8 text-center text-sm">
                  Esta missão ainda não tem questões cadastradas. Fale com seu
                  professor.
                </p>
              ) : (
                <MissionQuiz
                  questions={questions}
                  answers={answers}
                  disabled={mutation.isPending}
                  onAnswer={handleAnswer}
                />
              )
            ) : (
              <MissionMedia mission={mission} />
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
                  {isQuiz && " — proporcional aos acertos"}
                </p>
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

          {!result && (
            <Button
              className="bg-brand-gradient"
              disabled={
                mutation.isPending ||
                withoutQuestions ||
                (isQuiz && !allAnswered)
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
