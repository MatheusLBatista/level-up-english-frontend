import { z } from "zod";

const name = z.string().trim().min(2, "Use pelo menos 2 letras no nome.");

export const createTeacherSchema = z.object({
  name,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Digite um e-mail válido.")),
  classes: z.array(z.string()),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;

export const editTeacherSchema = z.object({
  name,
  classes: z.array(z.string()),
});

export type EditTeacherInput = z.infer<typeof editTeacherSchema>;
