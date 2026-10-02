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
import { useUpdateStudent } from "@/hooks/use-update-student";
import type { User } from "@/lib/types";

type DeactivateStudentDialogProps = {
  student: User | null;
  onClose: () => void;
};

export function DeactivateStudentDialog({
  student,
  onClose,
}: DeactivateStudentDialogProps) {
  const mutation = useUpdateStudent();

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
    if (!student) {
      return;
    }

    mutation.mutate(
      { student, body: { active: false } },
      { onSuccess: close },
    );
  }

  return (
    <AlertDialog open={student !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desativar aluno?</AlertDialogTitle>
          <AlertDialogDescription>
            {student?.name} não vai mais conseguir entrar na plataforma. O XP,
            o nível e o histórico ficam guardados, e você pode reativar a conta
            quando quiser.
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
