"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
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
import { useSetAttitudeActive } from "@/hooks/use-set-attitude-active";
import type { Attitude } from "@/lib/types";

type DeactivateAttitudeDialogProps = {
  attitude: Attitude | null;
  onClose: () => void;
};

export function DeactivateAttitudeDialog({
  attitude,
  onClose,
}: DeactivateAttitudeDialogProps) {
  const mutation = useSetAttitudeActive();

  function close() {
    mutation.reset();
    onClose();
  }

  function handleOpenChange(open: boolean) {
    if (!open && !mutation.isPending) {
      close();
    }
  }

  function handleConfirm() {
    if (!attitude) {
      return;
    }

    mutation.mutate({ attitude, active: false }, { onSuccess: close });
  }

  return (
    <AlertDialog open={attitude !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desativar atitude?</AlertDialogTitle>
          <AlertDialogDescription>
            Os professores deixam de ver “{attitude?.name}” no painel. O XP que
            ela já deu ou tirou dos alunos continua valendo, e você pode
            reativá-la quando quiser.
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
              <Trash2Icon />
            )}
            {mutation.isPending ? "Desativando…" : "Desativar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
