import { LockKeyholeIcon } from "lucide-react";
import { LegalLinks } from "@/components/legal/legal-links";
import { Card, CardContent } from "@/components/ui/card";
import type { Role } from "@/lib/types";

const descriptions: Record<Role, string> = {
  student:
    "Para ver, corrigir ou apagar os seus dados, peça para a escola ou para o seu professor.",
  teacher:
    "Pedidos de alunos e responsáveis sobre os dados (acesso, correção, eliminação) são atendidos pela escola.",
  admin:
    "Pedidos dos titulares (art. 18) são atendidos pela ficha do aluno, em Alunos: exportar e eliminar dados.",
};

/** Links para as páginas legais, visíveis no perfil de todos os papéis. */
export function PrivacyCard({ role }: { role: Role }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex min-w-0 flex-1 gap-3">
          <LockKeyholeIcon className="text-muted-foreground mt-0.5 size-5 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold">Privacidade e dados</p>
            <p className="text-muted-foreground text-sm">
              {descriptions[role]}
            </p>
          </div>
        </div>
        <LegalLinks
          newTab
          className="justify-start sm:max-w-xs sm:justify-end"
        />
      </CardContent>
    </Card>
  );
}
