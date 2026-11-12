"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEraseStudentData } from "@/hooks/use-student-privacy";
import { matchesTypedName } from "@/lib/consent";
import type { User } from "@/lib/types";

type EraseStudentDialogProps = {
  student: User | null;
  onClose: () => void;
  onErased: (updated: User) => void;
};

/**
 * Eliminação a pedido do titular (art. 18, VI). Irreversível: o admin precisa
 * digitar o nome do aluno para liberar o botão, além de o backend exigir
 * `confirm: true`.
 */
export function EraseStudentDialog({
  student,
  onClose,
  onErased,
}: EraseStudentDialogProps) {
  const mutation = useEraseStudentData();
  const [typedName, setTypedName] = useState("");
  const confirmed = student ? matchesTypedName(typedName, student.name) : false;

  function close() {
    mutation.reset();
    setTypedName("");
    onClose();
  }

  function handleConfirm() {
    if (!student || !confirmed) {
      return;
    }

    mutation.mutate(student, {
      onSuccess: (updated) => {
        onErased(updated);
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
          <AlertDialogTitle>
            Eliminar os dados de {student?.name}?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2">
              <p>
                <strong className="text-foreground">
                  Esta ação não pode ser desfeita.
                </strong>{" "}
                Use quando o aluno ou os responsáveis pedirem a eliminação.
              </p>
              <ul className="list-disc pl-5">
                <li>
                  O nome vira “Aluno removido” e o e-mail é trocado por um
                  endereço fictício.
                </li>
                <li>A foto, as notificações e o acesso são apagados.</li>
                <li>
                  O XP e o progresso ficam só no registro anônimo, para não
                  mudar os rankings e as médias da turma.
                </li>
                <li>
                  Se precisar entregar uma cópia dos dados, exporte antes.
                </li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Field>
          <FieldLabel htmlFor="erase-confirm-name">
            Digite o nome do aluno para confirmar
          </FieldLabel>
          <Input
            id="erase-confirm-name"
            value={typedName}
            onChange={(event) => setTypedName(event.target.value)}
            placeholder={student?.name}
            autoComplete="off"
            disabled={mutation.isPending}
            aria-describedby="erase-confirm-name-description"
          />
          <FieldDescription id="erase-confirm-name-description">
            Maiúsculas e minúsculas não importam.
          </FieldDescription>
        </Field>

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
            disabled={!confirmed || mutation.isPending}
            onClick={handleConfirm}
          >
            {mutation.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <Trash2Icon />
            )}
            {mutation.isPending ? "Eliminando…" : "Eliminar definitivamente"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
