import { z } from "zod";

export const classFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Dê um nome à turma.")
    .max(60, "Use no máximo 60 caracteres."),
  teacher: z.string().min(1, "Escolha o professor da turma."),
  active: z.boolean(),
});

export type ClassFormInput = z.infer<typeof classFormSchema>;
