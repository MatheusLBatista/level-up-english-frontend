"use client";

import { MissionForm } from "@/components/missions/mission-form";
import { UnsavedChangesDialog } from "@/components/shared/unsaved-changes-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDraftDialog } from "@/hooks/use-draft-form";
import { useSaveMission } from "@/hooks/use-save-mission";
import type { ClassSummary, Mission } from "@/lib/types";

type MissionFormDialogProps = {
  open: boolean;
  mission: Mission | null;
  classes: ClassSummary[];
  defaultClassId: string | null;
  onClose: () => void;
};

export function MissionFormDialog({
  open,
  mission,
  classes,
  defaultClassId,
  onClose,
}: MissionFormDialogProps) {
  const mutation = useSaveMission();
  const { close, handleOpenChange, onDirtyChange, confirmDialog } =
    useDraftDialog({
      open,
      scope: "mission-form",
      itemId: mission?._id ?? null,
      isPending: mutation.isPending,
      onClose: () => {
        mutation.reset();
        onClose();
      },
    });

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[85vh] gap-6 overflow-y-auto sm:max-w-lg">
          <MissionForm
            mission={mission}
            classes={classes}
            defaultClassId={defaultClassId}
            mutation={mutation}
            onSaved={close}
            onDirtyChange={onDirtyChange}
          />
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        {...confirmDialog}
        whereItComesBack={
          mission
            ? "quando você editar esta missão de novo"
            : "na próxima vez que você criar uma missão"
        }
      />
    </>
  );
}
