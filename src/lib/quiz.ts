import { shuffle } from "@/lib/shuffle";
import type { MissionQuestion, QuizAnswer } from "@/lib/types";

export type QuizQuestion = MissionQuestion & {
  originalIndex: number;
};

export function withOriginalIndex(
  questions: MissionQuestion[],
): QuizQuestion[] {
  return questions.map((question, originalIndex) => ({
    ...question,
    originalIndex,
  }));
}

export function shuffleQuestions(
  questions: MissionQuestion[],
  random = Math.random,
): QuizQuestion[] {
  return shuffle(withOriginalIndex(questions), random);
}

export function chooseAnswer(
  answers: (QuizAnswer | null)[],
  question: QuizQuestion,
  answer: QuizAnswer,
): (QuizAnswer | null)[] {
  return answers.map((value, index) =>
    index === question.originalIndex ? answer : value,
  );
}

export function inScreenOrder(
  questions: QuizQuestion[],
  answers: (QuizAnswer | null)[],
): (QuizAnswer | null)[] {
  return questions.map((question) => answers[question.originalIndex] ?? null);
}
