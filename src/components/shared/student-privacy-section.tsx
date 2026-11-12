"use client";

import { FileCheckIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRecordGuardianConsent } from "@/hooks/use-student-privacy";
import {
  canRecordConsent,
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
  pending: "border-brand-level/40 bg-brand-level/10",
  recorded: "border-brand-done/40 bg-brand-done/10",
  revoked: "border-destructive/40 bg-destructive/10",
  erased: "border-border bg-muted/40",
};

function describeStatus(student: User, status: ConsentStatus) {
  switch (status) {
    case "pending":
      return student.active
        ? "A escola ainda não registrou o termo assinado pelos responsáveis. Registre assim que recebê-lo."
        : "Sem termo registrado. Para registrar, reative a conta primeiro.";
    case "recorded":
      return student.guardian_consent_at
        ? `Termo recebido em ${formatFullDate(student.guardian_consent_at)}.`
        : "Termo recebido.";
    case "revoked":
      return student.guardian_consent_revoked_at
        ? `Os responsáveis revogaram o consentimento em ${formatFullDate(student.guardian_consent_revoked_at)}. A conta foi desativada e os dados seguem o prazo de retenção.`
        : "Consentimento revogado.";
    case "erased":
      return student.anonymized_at
        ? `Os dados pessoais foram eliminados em ${formatFullDate(student.anonymized_at)}. Só o XP e o progresso continuam, sem identificar o aluno.`
        : "Dados pessoais eliminados.";
  }
}

/** Seção "Termo dos responsáveis" da ficha do aluno (professor e admin). */
export function StudentPrivacySection({
  student,
  onChange,
}: StudentPrivacySectionProps) {
  const status = getConsentStatus(student);
  const [recordOpen, setRecordOpen] = useState(false);

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
        <div>
          <p className="text-sm font-semibold" data-testid="consent-status">
            {consentStatusLabels[status]}
          </p>
          <p className="text-muted-foreground text-xs">
            {describeStatus(student, status)}
          </p>
        </div>

        {canRecordConsent(student) && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setRecordOpen(true)}>
              <FileCheckIcon />
              Registrar termo
            </Button>
          </div>
        )}
      </div>

      <RecordConsentDialog
        student={recordOpen ? student : null}
        onClose={() => setRecordOpen(false)}
        onRecorded={onChange}
      />
    </section>
  );
}

type RecordConsentDialogProps = {
  student: User | null;
  onClose: () => void;
  onRecorded: (updated: User) => void;
};

function RecordConsentDialog({
  student,
  onClose,
  onRecorded,
}: RecordConsentDialogProps) {
  const mutation = useRecordGuardianConsent();

  function close() {
    mutation.reset();
    onClose();
  }

  function handleConfirm() {
    if (!student) {
      return;
    }

    mutation.mutate(student, {
      onSuccess: (updated) => {
        onRecorded(updated);
        close();
      },
    });
  }

  return (
    <AlertDialog
      open={student !== null}
      onOpenChange={(open) => !open && !mutation.isPending && close()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Registrar o termo?</AlertDialogTitle>
          <AlertDialogDescription>
            Confirme que a escola recebeu o termo de consentimento de{" "}
            {student?.name} assinado pelos responsáveis. Guarde o papel: ele é a
            prova do consentimento. A data e quem registrou ficam salvos.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.isError && (
          <p className="border-destructive/40 bg-destructive/10 rounded-xl border p-3 text-sm">
            {mutation.error.message}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <Button disabled={mutation.isPending} onClick={handleConfirm}>
            {mutation.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <FileCheckIcon />
            )}
            {mutation.isPending ? "Registrando…" : "Termo recebido"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
