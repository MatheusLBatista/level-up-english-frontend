"use client";

import { DownloadIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { EraseStudentDialog } from "@/components/admin/students/erase-student-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useExportStudentData } from "@/hooks/use-student-privacy";
import { getConsentStatus } from "@/lib/consent";
import type { User } from "@/lib/types";

type StudentDataSectionProps = {
  student: User;
  onChange: (updated: User) => void;
};

/**
 * "Dados do aluno" na ficha: só o admin atende os pedidos do titular
 * (art. 18, II acesso e VI eliminação). Para o professor, não aparece.
 */
export function StudentDataSection({
  student,
  onChange,
}: StudentDataSectionProps) {
  const { user } = useAuth();
  const exportMutation = useExportStudentData();
  const [eraseOpen, setEraseOpen] = useState(false);

  if (user?.role !== "admin") {
    return null;
  }

  const erased = getConsentStatus(student) === "erased";

  return (
    <section aria-labelledby="student-data" className="flex flex-col gap-3">
      <div>
        <h3 id="student-data" className="text-sm font-semibold">
          Dados do aluno (LGPD)
        </h3>
        <p className="text-muted-foreground text-xs">
          Pedidos do aluno ou dos responsáveis: cópia dos dados ou eliminação.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={exportMutation.isPending}
          onClick={() => exportMutation.mutate(student)}
        >
          {exportMutation.isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <DownloadIcon />
          )}
          Exportar dados (JSON)
        </Button>

        {!erased && (
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setEraseOpen(true)}
          >
            <Trash2Icon />
            Eliminar dados do aluno
          </Button>
        )}
      </div>

      {exportMutation.isSuccess && (
        <p className="text-muted-foreground text-xs" role="status">
          Arquivo baixado. Entregue ao titular por um canal seguro.
        </p>
      )}
      {exportMutation.isError && (
        <p className="text-destructive text-xs" role="alert">
          {exportMutation.error.message}
        </p>
      )}

      <EraseStudentDialog
        student={eraseOpen ? student : null}
        onClose={() => setEraseOpen(false)}
        onErased={onChange}
      />
    </section>
  );
}
