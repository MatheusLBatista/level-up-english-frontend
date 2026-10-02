"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import Link from "next/link";
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
import type { ClassSummary, User } from "@/lib/types";

type DeactivateTeacherDialogProps = {
  teacher: User | null;
  /** Turmas ativas que hoje são dele. */
  classes: ClassSummary[];
  onClose: () => void;
};

export function DeactivateTeacherDialog({
  teacher,
  classes,
  onClose,
}: DeactivateTeacherDialogProps) {
  const mutation = useUpdateUser();

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
    if (!teacher) {
      return;
    }

    mutation.mutate(
      { user: teacher, body: { active: false } },
      { onSuccess: close },
    );
  }

  return (
    <AlertDialog open={teacher !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desativar professor?</AlertDialogTitle>
          <AlertDialogDescription>
            {teacher?.name} não vai mais conseguir entrar na plataforma. As
            missões e as atitudes que aplicou continuam valendo, e você pode
            reativar a conta quando quiser.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {classes.length > 0 && (
          <div className="border-brand-level/40 bg-brand-level/10 rounded-xl border p-3 text-sm">
            <p>
              {classes.length === 1
                ? "Esta turma fica sem professor ativo:"
                : `Estas ${classes.length} turmas ficam sem professor ativo:`}
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {classes.map((item) => (
                <li
                  key={item._id}
                  className="border-brand-level/40 text-brand-level rounded-md border border-dashed px-2 py-0.5 text-xs font-semibold"
                >
                  {item.name}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-2 text-xs">
              Passe cada uma para outro professor em{" "}
              <Link href="/turmas" className="underline underline-offset-2">
                Turmas
              </Link>
              .
            </p>
          </div>
        )}

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
