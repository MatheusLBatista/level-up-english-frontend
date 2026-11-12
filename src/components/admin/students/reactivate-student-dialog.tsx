"use client";

import { Loader2Icon, RotateCcwIcon } from "lucide-react";
import { useState } from "react";
import { GuardianConsentCheckbox } from "@/components/shared/guardian-consent-checkbox";
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
import { useUpdateUser } from "@/hooks/use-update-user";
import { ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

type ReactivateStudentDialogProps = {
  /** Aluno com consentimento revogado; `null` fecha o diálogo. */
  student: User | null;
  onClose: () => void;
};

/**
 * Reativar um aluno cujo consentimento foi revogado exige um termo novo
 * assinado pelos responsáveis: o backend responde 409 sem
 * `guardian_consent: true`.
 */
export function ReactivateStudentDialog({
  student,
  onClose,
}: ReactivateStudentDialogProps) {
  const mutation = useUpdateUser();
  const [consent, setConsent] = useState(false);

  function close() {
    mutation.reset();
    setConsent(false);
    onClose();
  }

  function handleConfirm() {
    if (!student || !consent) {
      return;
    }

    mutation.mutate(
      { user: student, body: { active: true, guardian_consent: true } },
      { onSuccess: close },
    );
  }

  const consentError =
    mutation.error instanceof ApiError
      ? mutation.error.errors.find((item) => item.path === "guardian_consent")
          ?.message
      : undefined;

  return (
    <AlertDialog
      open={student !== null}
      onOpenChange={(open) => !open && !mutation.isPending && close()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reativar {student?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Os responsáveis revogaram o consentimento deste aluno. Para ele
            voltar a entrar na plataforma, a escola precisa receber um termo
            novo assinado.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <GuardianConsentCheckbox
          id="reactivate-guardian-consent"
          label="Termo novo assinado pelos responsáveis recebido"
          checked={consent}
          onCheckedChange={setConsent}
          disabled={mutation.isPending}
          error={consentError}
        />

        {mutation.isError && !consentError && (
          <p className="border-destructive/40 bg-destructive/10 rounded-xl border p-3 text-sm">
            {mutation.error.message}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <Button
            disabled={!consent || mutation.isPending}
            onClick={handleConfirm}
          >
            {mutation.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <RotateCcwIcon />
            )}
            {mutation.isPending ? "Reativando…" : "Reativar com termo novo"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
