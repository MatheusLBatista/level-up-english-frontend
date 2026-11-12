import { FileXIcon, ShieldOffIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  consentStatusLabels,
  getConsentStatus,
  type ConsentStatus,
} from "@/lib/consent";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<Exclude<ConsentStatus, "recorded">, string> = {
  revoked: "border-destructive/40 text-destructive",
  erased: "border-border text-muted-foreground",
};

const icons = {
  revoked: FileXIcon,
  erased: ShieldOffIcon,
};

/**
 * Selo da situação do termo nas listas. Termo registrado é o caso normal e
 * não ganha selo, para a lista não ficar poluída.
 */
export function ConsentBadge({
  student,
  className,
}: {
  student: User;
  className?: string;
}) {
  const status = getConsentStatus(student);

  if (status === "recorded") {
    return null;
  }

  const Icon = icons[status];

  return (
    <Badge
      variant="outline"
      className={cn("text-label shrink-0", styles[status], className)}
    >
      <Icon />
      {consentStatusLabels[status]}
    </Badge>
  );
}
