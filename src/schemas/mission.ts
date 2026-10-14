import { z } from "zod";
import type { MissionType } from "@/lib/types";

/** Quantas perguntas cada tipo exige — as mesmas regras do backend. */
export const questionLimits: Record<
  MissionType,
  { min: number; max: number | null }
> = {
  quiz: { min: 5, max: null },
  vocabulary: { min: 1, max: 3 },
  audio: { min: 1, max: 3 },
};

export function describeQuestionLimit(type: MissionType) {
  const { min, max } = questionLimits[type];

  return max === null
    ? `O quiz precisa de no mínimo ${min} perguntas.`
    : `Cadastre de ${min} a ${max} perguntas de checagem.`;
}

export const answerKeys = ["a", "b", "c", "d"] as const;

const questionDraftSchema = z.object({
  question: z.string().trim(),
  options: z.object({
    a: z.string().trim(),
    b: z.string().trim(),
    c: z.string().trim(),
    d: z.string().trim(),
  }),
  correct_answer: z.enum(answerKeys),
});

const httpUrl = z.url({ protocol: /^https?$/ });

export const missionFormSchema = z
  .object({
    type: z.enum(["quiz", "vocabulary", "audio"]),
    title: z.string().trim().min(1, "Dê um título à missão."),
    description: z.string().trim(),
    xp_reward: z
      .number({ error: "Informe o XP." })
      .int("Use um número inteiro.")
      .min(0, "O XP não pode ser negativo."),
    class_id: z.string().min(1, "Escolha a turma."),
    active: z.boolean(),
    content: z.string().trim(),
    content_url: z.string().trim(),
    questions: z.array(questionDraftSchema),
  })
  .superRefine((data, ctx) => {
    if (data.type === "vocabulary" && !data.content) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "Missões de vocabulário precisam de conteúdo.",
      });
    }

    if (data.type === "audio") {
      if (!data.content_url) {
        ctx.addIssue({
          code: "custom",
          path: ["content_url"],
          message: "Informe o link do áudio ou vídeo.",
        });
      } else if (!httpUrl.safeParse(data.content_url).success) {
        ctx.addIssue({
          code: "custom",
          path: ["content_url"],
          message: "Link inválido. Use um endereço completo, com https://.",
        });
      }
    }

    const { min, max } = questionLimits[data.type];
    const count = data.questions.length;

    if (count < min || (max !== null && count > max)) {
      ctx.addIssue({
        code: "custom",
        path: ["questions"],
        message: describeQuestionLimit(data.type),
      });
    }

    data.questions.forEach((item, index) => {
      if (!item.question) {
        ctx.addIssue({
          code: "custom",
          path: ["questions", index, "question"],
          message: "Escreva a pergunta.",
        });
      }

      for (const key of answerKeys) {
        if (!item.options[key]) {
          ctx.addIssue({
            code: "custom",
            path: ["questions", index, "options", key],
            message: "Preencha a alternativa.",
          });
        }
      }
    });
  });

export type MissionFormInput = z.infer<typeof missionFormSchema>;
export type QuestionFormInput = MissionFormInput["questions"][number];
