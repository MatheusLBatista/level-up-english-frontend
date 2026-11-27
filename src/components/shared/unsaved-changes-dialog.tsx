"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type UnsavedChangesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Onde o rascunho volta, ex.: "ao editar esta missão de novo". */
  whereItComesBack: string;
  onKeepDraft: () => void;
  onDiscard: () => void;
};

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  whereItComesBack,
  onKeepDraft,
  onDiscard,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Sair sem salvar?</AlertDialogTitle>
          <AlertDialogDescription>
            Suas alterações ficam guardadas como rascunho neste navegador e
            voltam {whereItComesBack}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continuar editando</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="sm:order-first sm:mr-auto"
            onClick={onDiscard}
          >
            Descartar
          </AlertDialogAction>
          <AlertDialogAction onClick={onKeepDraft}>
            Guardar e sair
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
