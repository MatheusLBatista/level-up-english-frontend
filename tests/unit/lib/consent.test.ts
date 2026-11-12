import { describe, expect, it } from "vitest";
import {
  canRevokeConsent,
  dataExportFileName,
  getConsentStatus,
  matchesTypedName,
  needsNewConsentToReactivate,
} from "@/lib/consent";

const DATE = "2026-11-12T14:00:00.000Z";

const recorded = {
  active: true,
  anonymized_at: null,
  guardian_consent_at: DATE,
  guardian_consent_revoked_at: null,
};

const revoked = {
  ...recorded,
  active: false,
  guardian_consent_revoked_at: DATE,
};

describe("getConsentStatus", () => {
  it("todo aluno criado tem o termo registrado", () => {
    expect(getConsentStatus(recorded)).toBe("recorded");
  });

  it("não existe mais termo pendente: sem a data continua registrado", () => {
    expect(getConsentStatus({ ...recorded, guardian_consent_at: null })).toBe(
      "recorded",
    );
  });

  it("com a data de revogação é revogado", () => {
    expect(getConsentStatus(revoked)).toBe("revoked");
  });

  it("a eliminação vence a revogação", () => {
    expect(getConsentStatus({ ...revoked, anonymized_at: DATE })).toBe(
      "erased",
    );
  });
});

describe("canRevokeConsent", () => {
  it("permite revogar o termo registrado", () => {
    expect(canRevokeConsent(recorded)).toBe(true);
  });

  it("recusa revogar de novo ou depois da eliminação", () => {
    expect(canRevokeConsent(revoked)).toBe(false);
    expect(canRevokeConsent({ ...recorded, anonymized_at: DATE })).toBe(false);
  });
});

describe("needsNewConsentToReactivate", () => {
  it("exige termo novo para reativar aluno revogado", () => {
    expect(needsNewConsentToReactivate(revoked)).toBe(true);
  });

  it("não exige para aluno desativado sem revogação", () => {
    expect(needsNewConsentToReactivate({ ...recorded, active: false })).toBe(
      false,
    );
  });

  it("não exige para aluno ativo nem para aluno eliminado", () => {
    expect(needsNewConsentToReactivate(recorded)).toBe(false);
    expect(
      needsNewConsentToReactivate({ ...revoked, anonymized_at: DATE }),
    ).toBe(false);
  });
});

describe("dataExportFileName", () => {
  it("usa o id do aluno e o dia da exportação", () => {
    expect(dataExportFileName("abc123", DATE)).toBe(
      "dados-aluno-abc123-2026-11-12.json",
    );
  });
});

describe("matchesTypedName", () => {
  it("aceita o nome sem diferenciar maiúsculas nem espaços sobrando", () => {
    expect(
      matchesTypedName("  arthur   NASCIMENTO ", "Arthur Nascimento"),
    ).toBe(true);
  });

  it("recusa nome incompleto ou sem o acento", () => {
    expect(matchesTypedName("Arthur", "Arthur Nascimento")).toBe(false);
    expect(matchesTypedName("Joao", "João")).toBe(false);
  });

  it("recusa confirmar com campo vazio", () => {
    expect(matchesTypedName("", "")).toBe(false);
  });
});
