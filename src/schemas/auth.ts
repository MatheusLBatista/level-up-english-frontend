import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Informe um email válido"),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um email válido")),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const newPasswordSchema = z
  .object({
    password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "As senhas não conferem.",
  });

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
