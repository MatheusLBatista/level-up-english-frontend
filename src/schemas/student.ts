import { z } from "zod";

/** Valor do Select para "sem turma" — o Radix não aceita `value=""`. */
export const NO_CLASS = "none";

export const studentFormSchema = z.object({
  name: z.string().trim().min(2, "Use pelo menos 2 letras no nome."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Digite um e-mail válido.")),
  class: z.string(),
});

export type StudentFormInput = z.infer<typeof studentFormSchema>;

export const editStudentSchema = z.object({
  name: z.string().trim().min(2, "Use pelo menos 2 letras no nome."),
  class: z.string(),
  active: z.boolean(),
});

export type EditStudentInput = z.infer<typeof editStudentSchema>;
