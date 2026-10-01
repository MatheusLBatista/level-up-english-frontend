"use client";

import { MissionForm } from "@/components/missions/mission-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

  function close() {
    mutation.reset();
    onClose();
  }

  function handleOpenChange(next: boolean) {
    if (!next && !mutation.isPending) {
      close();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] gap-6 overflow-y-auto sm:max-w-lg">
        <MissionForm
          mission={mission}
          classes={classes}
          defaultClassId={defaultClassId}
          mutation={mutation}
          onSaved={close}
        />
      </DialogContent>
    </Dialog>
  );
}
