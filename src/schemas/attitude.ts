import { z } from "zod";

export const attitudeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Use pelo menos 2 letras no nome.")
    .max(60, "Use no máximo 60 caracteres."),
  description: z.string().trim().max(200, "Use no máximo 200 caracteres."),
  /** Com sinal: positivo é prêmio, negativo é punição. */
  xp: z
    .number({ error: "Informe a quantidade de XP." })
    .int("Use um número inteiro.")
    .min(-1000, "O mínimo é -1.000 XP.")
    .max(1000, "O máximo é 1.000 XP.")
    .refine((value) => value !== 0, "Use um valor diferente de zero."),
});

export type AttitudeFormInput = z.infer<typeof attitudeFormSchema>;
