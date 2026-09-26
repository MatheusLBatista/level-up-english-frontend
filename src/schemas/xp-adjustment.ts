import { z } from "zod";

export const xpAdjustmentSchema = z.object({
  amount: z
    .number({ error: "Informe a quantidade de XP." })
    .int("Use um número inteiro.")
    .min(1, "O mínimo é 1 XP.")
    .max(10000, "O máximo é 10.000 XP."),
  reason: z
    .string()
    .trim()
    .max(200, "O motivo pode ter no máximo 200 caracteres."),
});

export type XpAdjustmentInput = z.infer<typeof xpAdjustmentSchema>;
