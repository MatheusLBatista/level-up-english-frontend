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
import { useSetMissionActive } from "@/hooks/use-set-mission-active";
import type { Mission } from "@/lib/types";

type DeactivateMissionDialogProps = {
  mission: Mission | null;
  onClose: () => void;
};

export function DeactivateMissionDialog({
  mission,
  onClose,
}: DeactivateMissionDialogProps) {
  const mutation = useSetMissionActive();

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
    if (!mission) {
      return;
    }

    mutation.mutate({ mission, active: false }, { onSuccess: close });
  }

  return (
    <AlertDialog open={mission !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desativar missão?</AlertDialogTitle>
          <AlertDialogDescription>
            “{mission?.title}” deixa de aparecer para os alunos da turma. O
            progresso e o XP que eles já ganharam continuam, e você pode
            reativar a missão quando quiser.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {mutation.isError && (
          <p className="border-destructive/40 bg-destructive/10 rounded-xl border p-3 text-sm">
            {mutation.error.message}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancelar</AlertDialogCancel>
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
