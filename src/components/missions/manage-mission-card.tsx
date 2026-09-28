import { PencilIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import { MissionCard } from "@/components/missions/mission-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Mission } from "@/lib/types";

type ManageMissionCardProps = {
  mission: Mission;
  canManage: boolean;
  onEdit?: (mission: Mission) => void;
  onToggleActive?: (mission: Mission) => void;
};

export function ManageMissionCard({
  mission,
  canManage,
  onEdit,
  onToggleActive,
}: ManageMissionCardProps) {
  const questionCount = mission.questions?.length ?? 0;
  const toggleLabel = mission.active
    ? `Desativar ${mission.title}`
    : `Reativar ${mission.title}`;

  const footer = (
    <div className="border-border/40 flex items-center gap-2 border-t pt-3">
      <div className="text-muted-foreground flex min-w-0 flex-1 flex-wrap items-center gap-2 text-xs">
        {mission.type === "quiz" && (
          <span>
            {questionCount} {questionCount === 1 ? "pergunta" : "perguntas"}
          </span>
        )}

        {!mission.active && (
          <Badge
            variant="outline"
            className="border-destructive/40 text-destructive text-[10px] tracking-wider uppercase"
          >
            Inativa
          </Badge>
        )}

        {!canManage && mission.createdBy && (
          <span className="truncate">Criada por {mission.createdBy.name}</span>
        )}
      </div>

      {canManage && (
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={`Editar ${mission.title}`}
            title="Editar"
            disabled={!onEdit}
            onClick={() => onEdit?.(mission)}
          >
            <PencilIcon />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={toggleLabel}
            title={mission.active ? "Desativar" : "Reativar"}
            className={mission.active ? "hover:text-destructive" : "hover:text-brand-done"}
            disabled={!onToggleActive}
            onClick={() => onToggleActive?.(mission)}
          >
            {mission.active ? <Trash2Icon /> : <RotateCcwIcon />}
          </Button>
        </div>
      )}
    </div>
  );

  return <MissionCard mission={mission} action={footer} />;
}
