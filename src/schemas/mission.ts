import { z } from "zod";

export const MIN_QUIZ_QUESTIONS = 5;

const option = z.string().trim().min(1, "Preencha a alternativa.");

export const questionSchema = z.object({
  question: z.string().trim().min(1, "Escreva a pergunta."),
  options: z.object({ a: option, b: option, c: option, d: option }),
  correct_answer: z.enum(["a", "b", "c", "d"], {
    error: "Marque a alternativa correta.",
  }),
});

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
    questions: z.array(questionSchema),
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
      } else if (!z.url().safeParse(data.content_url).success) {
        ctx.addIssue({
          code: "custom",
          path: ["content_url"],
          message: "Link inválido. Use um endereço completo, com https://.",
        });
      }
    }

    if (data.type === "quiz" && data.questions.length < MIN_QUIZ_QUESTIONS) {
      ctx.addIssue({
        code: "custom",
        path: ["questions"],
        message: `O quiz precisa de no mínimo ${MIN_QUIZ_QUESTIONS} perguntas.`,
      });
    }
  });

export type MissionFormInput = z.infer<typeof missionFormSchema>;
