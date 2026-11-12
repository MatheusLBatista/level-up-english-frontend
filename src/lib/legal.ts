/**
 * Números citados nas páginas legais. Precisam bater com o backend:
 * - RETENTION_MONTHS: padrão de `RETENTION_MONTHS` (RetentionService.js);
 * - BACKUP_KEEP_DAYS: padrão de `KEEP_DAYS` em scripts/backup-mongo.sh;
 * - NOTIFICATION_DAYS: índice TTL de models/Notification.js.
 * Se a escola mudar algum deles no servidor, mude aqui também.
 */
export const RETENTION_MONTHS = 12;
export const BACKUP_KEEP_DAYS = 7;
export const NOTIFICATION_DAYS = 90;

/** Data da última revisão do texto, mostrada no topo das páginas. */
export const LEGAL_UPDATED_AT = "12 de novembro de 2026";

export const legalLinks = [
  { href: "/privacidade", label: "Política de privacidade" },
  { href: "/termos", label: "Termos de uso" },
  { href: "/termo-responsaveis", label: "Termo dos responsáveis" },
] as const;
