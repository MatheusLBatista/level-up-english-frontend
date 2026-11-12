import { describe, expect, it } from "vitest";
import {
  GUARDIAN_CONSENT_MESSAGE,
  NO_CLASS,
  studentFormSchema,
} from "@/schemas/student";

const valid = {
  name: "João Silva",
  email: "  Joao@Email.com ",
  class: NO_CLASS,
  guardian_consent: true,
};

describe("studentFormSchema", () => {
  it("aceita o aluno com o termo dos responsáveis confirmado", () => {
    const result = studentFormSchema.safeParse(valid);

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("joao@email.com");
  });

  it("recusa sem a confirmação do termo, com a mensagem do backend", () => {
    const result = studentFormSchema.safeParse({
      ...valid,
      guardian_consent: false,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({
        path: ["guardian_consent"],
        message: GUARDIAN_CONSENT_MESSAGE,
      }),
    ]);
  });

  it("recusa quando o campo nem vem", () => {
    const withoutConsent: Partial<typeof valid> = { ...valid };
    delete withoutConsent.guardian_consent;

    expect(studentFormSchema.safeParse(withoutConsent).success).toBe(false);
  });
});
