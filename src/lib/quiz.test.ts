import { describe, expect, it } from "vitest";
import { chooseAnswer, inScreenOrder, shuffleQuestions } from "@/lib/quiz";
import type { MissionQuestion, QuizAnswer } from "@/lib/types";

const questions: MissionQuestion[] = [
  { question: "Q1", options: { a: "1a", b: "1b", c: "1c", d: "1d" } },
  { question: "Q2", options: { a: "2a", b: "2b", c: "2c", d: "2d" } },
  { question: "Q3", options: { a: "3a", b: "3b", c: "3c", d: "3d" } },
];

describe("shuffleQuestions", () => {
  it("guarda a posição original de cada pergunta", () => {
    const shuffled = shuffleQuestions(questions);

    expect(shuffled.map((item) => item.originalIndex).sort()).toEqual([
      0, 1, 2,
    ]);
    shuffled.forEach((item) => {
      expect(item.question).toBe(questions[item.originalIndex].question);
      expect(item.options).toEqual(questions[item.originalIndex].options);
    });
  });

  it("não muta as perguntas da API", () => {
    const copy = structuredClone(questions);

    shuffleQuestions(questions);

    expect(questions).toEqual(copy);
  });
});

describe("chooseAnswer", () => {
  const shuffled = shuffleQuestions(questions, () => 0);

  it("embaralha de forma previsível com random fixo", () => {
    expect(shuffled.map((item) => item.question)).toEqual(["Q2", "Q3", "Q1"]);
  });

  it("monta as respostas dadas na tela na ordem original", () => {
    const picked: QuizAnswer[] = ["b", "c", "a"];

    const answers = shuffled.reduce(
      (list, question, position) =>
        chooseAnswer(list, question, picked[position]),
      questions.map((): QuizAnswer | null => null),
    );

    expect(answers).toEqual(["a", "b", "c"]);
  });

  it("não muta o array de respostas e mantém o tamanho", () => {
    const answers: (QuizAnswer | null)[] = [null, null, null];

    const result = chooseAnswer(answers, shuffled[0], "d");

    expect(answers).toEqual([null, null, null]);
    expect(result).toEqual([null, "d", null]);
  });
});

describe("inScreenOrder", () => {
  it("lê as respostas na ordem em que as perguntas aparecem", () => {
    const shuffled = shuffleQuestions(questions, () => 0);

    expect(inScreenOrder(shuffled, ["a", null, "c"])).toEqual([null, "c", "a"]);
  });
});
