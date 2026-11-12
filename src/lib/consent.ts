import type { User } from "@/lib/types";

/**
 * Situação do aluno perante a LGPD, na ordem em que o backend decide:
 * - `erased`: dados pessoais eliminados (prazo de retenção ou pedido do titular);
 * - `revoked`: os responsáveis revogaram o consentimento (a conta foi desativada);
 * - `recorded`: termo registrado. Todo aluno nasce assim: o backend só cria o
 *   aluno com `guardian_consent: true`.
 */
export type ConsentStatus = "recorded" | "revoked" | "erased";

type ConsentFields = Pick<
  User,
  "anonymized_at" | "guardian_consent_at" | "guardian_consent_revoked_at"
>;

export function getConsentStatus(user: ConsentFields): ConsentStatus {
  if (user.anonymized_at) {
    return "erased";
  }

  return user.guardian_consent_revoked_at ? "revoked" : "recorded";
}

export const consentStatusLabels: Record<ConsentStatus, string> = {
  recorded: "Termo registrado",
  revoked: "Consentimento revogado",
  erased: "Dados eliminados",
};

/** Revogar só vale para termo registrado; o backend desativa a conta. */
export function canRevokeConsent(user: ConsentFields) {
  return getConsentStatus(user) === "recorded";
}

/**
 * Reativar um aluno com consentimento revogado exige um termo novo
 * (`guardian_consent: true` no PATCH); sem ele, o backend responde 409.
 */
export function needsNewConsentToReactivate(
  user: ConsentFields & Pick<User, "active">,
) {
  return !user.active && getConsentStatus(user) === "revoked";
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
