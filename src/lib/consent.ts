import type { User } from "@/lib/types";

/**
 * Situação do aluno perante a LGPD, na ordem em que o backend decide:
 * - `erased`: dados pessoais eliminados (prazo de retenção ou pedido do titular);
 * - `revoked`: os responsáveis revogaram o consentimento (a conta foi desativada);
 * - `recorded`: a escola registrou o termo assinado em papel;
 * - `pending`: aluno criado antes da regra, ainda sem termo registrado.
 */
export type ConsentStatus = "pending" | "recorded" | "revoked" | "erased";

type ConsentFields = Pick<
  User,
  "anonymized_at" | "guardian_consent_at" | "guardian_consent_revoked_at"
>;

export function getConsentStatus(user: ConsentFields): ConsentStatus {
  if (user.anonymized_at) {
    return "erased";
  }

  if (user.guardian_consent_revoked_at) {
    return "revoked";
  }

  return user.guardian_consent_at ? "recorded" : "pending";
}

export const consentStatusLabels: Record<ConsentStatus, string> = {
  pending: "Termo pendente",
  recorded: "Termo registrado",
  revoked: "Consentimento revogado",
  erased: "Dados eliminados",
};

/** Só faz sentido registrar o termo de um aluno ativo que ainda não o tem. */
export function canRecordConsent(user: ConsentFields & Pick<User, "active">) {
  return user.active && getConsentStatus(user) === "pending";
}

/** Revogar vale para termo pendente ou registrado; o backend desativa a conta. */
export function canRevokeConsent(user: ConsentFields) {
  const status = getConsentStatus(user);
  return status === "pending" || status === "recorded";
}

/** Nome do arquivo baixado na exportação dos dados (art. 18, II). */
export function dataExportFileName(studentId: string, exportedAt: string) {
  return `dados-aluno-${studentId}-${exportedAt.slice(0, 10)}.json`;
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
}

/**
 * Confirmação da eliminação: o nome digitado precisa bater com o do aluno,
 * sem diferenciar maiúsculas e ignorando espaços sobrando. Acentos contam.
 */
export function matchesTypedName(typed: string, name: string) {
  const expected = normalizeName(name);
  return expected.length > 0 && normalizeName(typed) === expected;
}
