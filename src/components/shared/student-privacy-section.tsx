"use client";

import { FileXIcon } from "lucide-react";
import { useState } from "react";
import { RevokeConsentDialog } from "@/components/shared/revoke-consent-dialog";
import { Button } from "@/components/ui/button";
import {
  canRevokeConsent,
  consentStatusLabels,
  getConsentStatus,
  type ConsentStatus,
} from "@/lib/consent";
import { formatFullDate } from "@/lib/date";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

type StudentPrivacySectionProps = {
  student: User;
  /** Recebe o aluno devolvido pela API, para a ficha refletir na hora. */
  onChange: (updated: User) => void;
};

const statusStyles: Record<ConsentStatus, string> = {
  recorded: "border-brand-done/40 bg-brand-done/10",
  revoked: "border-destructive/40 bg-destructive/10",
  erased: "border-border bg-muted/40",
};

const statusNotes: Record<ConsentStatus, string> = {
  recorded: "A escola guarda o termo em papel assinado pelos responsáveis.",
  revoked:
    "A conta foi desativada e os dados seguem o prazo de retenção. Para voltar, a escola reativa com um termo novo.",
  erased:
    "Os dados pessoais foram eliminados. Só o XP e o progresso continuam, sem identificar o aluno.",
};

/**
 * Seção "Termo dos responsáveis" da ficha do aluno (professor e admin): data
 * do registro, da revogação (se houver) e a ação de revogar.
 */
export function StudentPrivacySection({
  student,
  onChange,
}: StudentPrivacySectionProps) {
  const status = getConsentStatus(student);
  const [revokeOpen, setRevokeOpen] = useState(false);

  return (
    <section aria-labelledby="guardian-consent" className="flex flex-col gap-3">
      <h3 id="guardian-consent" className="text-sm font-semibold">
        Termo dos responsáveis
      </h3>

      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border p-3",
          statusStyles[status],
        )}
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold" data-testid="consent-status">
            {consentStatusLabels[status]}
          </p>

          <dl className="grid gap-1 text-xs">
            <ConsentDate
              testId="consent-recorded-at"
              label="Registrado em"
              date={student.guardian_consent_at}
            />
            {student.guardian_consent_revoked_at && (
              <ConsentDate
                testId="consent-revoked-at"
                label="Revogado em"
                date={student.guardian_consent_revoked_at}
              />
            )}
            {student.anonymized_at && (
              <ConsentDate
                testId="consent-erased-at"
                label="Dados eliminados em"
                date={student.anonymized_at}
              />
            )}
          </dl>

          <p className="text-muted-foreground text-xs">{statusNotes[status]}</p>
        </div>

        {canRevokeConsent(student) && (
          <div>
            <Button
              size="sm"
              variant="outline"
              className="hover:text-destructive"
              onClick={() => setRevokeOpen(true)}
            >
              <FileXIcon />
              Revogar consentimento
            </Button>
          </div>
        )}
      </div>

      <RevokeConsentDialog
        student={revokeOpen ? student : null}
        onClose={() => setRevokeOpen(false)}
        onRevoked={onChange}
      />
    </section>
  );
}

function ConsentDate({
  label,
  date,
  testId,
}: {
  label: string;
  date: string | null | undefined;
  testId: string;
}) {
  return (
    <div className="flex flex-wrap gap-x-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium" data-testid={testId}>
        {/* Só contas anteriores à regra podem vir sem a data. */}
        {date ? formatFullDate(date) : "data não informada"}
      </dd>
    </div>
  );
}
