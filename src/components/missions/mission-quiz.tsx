"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { MissionQuestion, QuizAnswer } from "@/lib/types";

const OPTION_KEYS: QuizAnswer[] = ["a", "b", "c", "d"];

type MissionQuizProps = {
  questions: MissionQuestion[];
  answers: (QuizAnswer | undefined)[];
  disabled: boolean;
  onAnswer: (index: number, answer: QuizAnswer) => void;
};

export function MissionQuiz({
  questions,
  answers,
  disabled,
  onAnswer,
}: MissionQuizProps) {
  return (
    <ol className="flex flex-col gap-4">
      {questions.map((question, index) => (
        <li
          key={index}
          className="border-border/40 bg-card/40 rounded-xl border p-4"
        >
          <p className="font-medium">
            <span className="text-muted-foreground mr-2 tabular-nums">
              {index + 1}.
            </span>
            {question.question}
          </p>

          <RadioGroup
            className="mt-3 gap-2"
            value={answers[index] ?? ""}
            disabled={disabled}
            onValueChange={(value) => onAnswer(index, value as QuizAnswer)}
          >
            {OPTION_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <RadioGroupItem value={key} id={`q${index}-${key}`} />
                <Label htmlFor={`q${index}-${key}`} className="font-normal">
                  {question.options[key]}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </li>
      ))}
    </ol>
  );
}
