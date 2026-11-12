"use client";

import { FileXIcon, Loader2Icon } from "lucide-react";
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
import { useRevokeGuardianConsent } from "@/hooks/use-student-privacy";
import { RETENTION_MONTHS } from "@/lib/legal";
import type { User } from "@/lib/types";

type RevokeConsentDialogProps = {
  student: User | null;
  onClose: () => void;
  onRevoked: (updated: User) => void;
};

/**
 * Revogação pedida pelos responsáveis. O backend registra a data e desativa a
 * conta na mesma chamada; o aluno sai dos rankings.
 */
export function RevokeConsentDialog({
  student,
  onClose,
  onRevoked,
}: RevokeConsentDialogProps) {
  const mutation = useRevokeGuardianConsent();

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
        onRevoked(updated);
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
          <AlertDialogTitle>Revogar o consentimento?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2">
              <p>
                Use quando os responsáveis por {student?.name} pedirem para
                retirar o consentimento.
              </p>
              <ul className="list-disc pl-5">
                <li>
                  A conta é desativada na hora e o aluno sai dos rankings.
                </li>
                <li>
                  Os dados ficam guardados por até {RETENTION_MONTHS} meses e
                  depois são anonimizados.
                </li>
                <li>
                  Para o aluno voltar, a escola reativa a conta com um termo
                  novo assinado pelos responsáveis.
                </li>
              </ul>
            </div>
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
          <Button
            variant="destructive"
            disabled={mutation.isPending}
            onClick={handleConfirm}
          >
            {mutation.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <FileXIcon />
            )}
            {mutation.isPending ? "Revogando…" : "Revogar e desativar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
