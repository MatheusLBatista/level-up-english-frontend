import { describe, expect, it } from "vitest";
import {
  canRecordConsent,
  canRevokeConsent,
  dataExportFileName,
  getConsentStatus,
  matchesTypedName,
} from "@/lib/consent";

const DATE = "2026-11-12T14:00:00.000Z";

const base = {
  active: true,
  anonymized_at: null,
  guardian_consent_at: null,
  guardian_consent_revoked_at: null,
};

describe("getConsentStatus", () => {
  it("sem termo e sem revogação é pendente", () => {
    expect(getConsentStatus(base)).toBe("pending");
  });

  it("trata usuário antigo, sem os campos, como pendente", () => {
    expect(getConsentStatus({})).toBe("pending");
  });

  it("com a data do termo é registrado", () => {
    expect(getConsentStatus({ ...base, guardian_consent_at: DATE })).toBe(
      "recorded",
    );
  });

  it("a revogação vence o registro", () => {
    expect(
      getConsentStatus({
        ...base,
        guardian_consent_at: DATE,
        guardian_consent_revoked_at: DATE,
      }),
    ).toBe("revoked");
  });

  it("a eliminação vence todo o resto", () => {
    expect(
      getConsentStatus({
        ...base,
        guardian_consent_revoked_at: DATE,
        anonymized_at: DATE,
      }),
    ).toBe("erased");
  });
});

describe("canRecordConsent", () => {
  it("permite registrar o termo pendente de aluno ativo", () => {
    expect(canRecordConsent(base)).toBe(true);
  });

  it("recusa aluno desativado, como o backend", () => {
    expect(canRecordConsent({ ...base, active: false })).toBe(false);
  });

  it("recusa termo já registrado", () => {
    expect(canRecordConsent({ ...base, guardian_consent_at: DATE })).toBe(
      false,
    );
  });
});

describe("canRevokeConsent", () => {
  it("permite revogar termo pendente ou registrado", () => {
    expect(canRevokeConsent(base)).toBe(true);
    expect(canRevokeConsent({ ...base, guardian_consent_at: DATE })).toBe(true);
  });

  it("recusa revogar de novo ou depois da eliminação", () => {
    expect(
      canRevokeConsent({ ...base, guardian_consent_revoked_at: DATE }),
    ).toBe(false);
    expect(canRevokeConsent({ ...base, anonymized_at: DATE })).toBe(false);
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
