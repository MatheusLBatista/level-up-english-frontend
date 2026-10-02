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
import { useSetClassActive } from "@/hooks/use-set-class-active";
import type { ClassSummary } from "@/lib/types";

type DeactivateClassDialogProps = {
  schoolClass: ClassSummary | null;
  onClose: () => void;
};

export function DeactivateClassDialog({
  schoolClass,
  onClose,
}: DeactivateClassDialogProps) {
  const mutation = useSetClassActive();

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
    if (!schoolClass) {
      return;
    }

    mutation.mutate({ schoolClass, active: false }, { onSuccess: close });
  }

  const studentCount = schoolClass?.students.length ?? 0;
  const missionCount = schoolClass?.missions.length ?? 0;

  return (
    <AlertDialog open={schoolClass !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desativar turma?</AlertDialogTitle>
          <AlertDialogDescription>
            “{schoolClass?.name}” sai dos seletores de turma do professor
            {schoolClass?.teacher ? ` (${schoolClass.teacher.name})` : ""}.
            {studentCount + missionCount > 0 &&
              " Os alunos e as missões dela continuam ligados à turma."}{" "}
            Nada é apagado, e você pode reativar a turma quando quiser.
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
