import { z } from "zod";

/** Valor do Select para "sem turma" — o Radix não aceita `value=""`. */
export const NO_CLASS = "none";

/** Mesma mensagem do backend (GUARDIAN_CONSENT_MESSAGE em UserSchema.js). */
export const GUARDIAN_CONSENT_MESSAGE =
  "Confirme o recebimento do termo de consentimento assinado pelos responsáveis.";

export const studentFormSchema = z.object({
  name: z.string().trim().min(2, "Use pelo menos 2 letras no nome."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Digite um e-mail válido.")),
  class: z.string(),
  /**
   * Não é um aceite do aluno: registra que a escola recebeu o termo em papel,
   * assinado pelos responsáveis. O backend exige `true` para criar o aluno.
   */
  guardian_consent: z.boolean().refine((value) => value, {
    message: GUARDIAN_CONSENT_MESSAGE,
  }),
});

export type StudentFormInput = z.infer<typeof studentFormSchema>;

export const editStudentSchema = z.object({
  name: z.string().trim().min(2, "Use pelo menos 2 letras no nome."),
  class: z.string(),
  active: z.boolean(),
});

export type EditStudentInput = z.infer<typeof editStudentSchema>;
