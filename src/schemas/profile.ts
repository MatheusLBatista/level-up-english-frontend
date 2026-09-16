import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "O nome precisa ter ao menos 3 caracteres.")
    .max(80, "O nome pode ter no máximo 80 caracteres."),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "A senha atual precisa ter ao menos 6 caracteres."),
    newPassword: z.string().min(6, "A nova senha precisa ter ao menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    message: "A nova senha precisa ser diferente da atual.",
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem.",
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
