import { PerformanceRadar } from "@/components/shared/performance-radar";
import { Card, CardContent } from "@/components/ui/card";

type ClassPerformanceProps = {
  classId: string;
  /** Qualquer aluno ativo da turma: a média da turma vem no desempenho dele. */
  studentId: string;
};

export function ClassPerformance({
  classId,
  studentId,
}: ClassPerformanceProps) {
  return (
    <section
      aria-labelledby="class-performance"
      className="flex flex-col gap-4"
    >
      <header className="flex flex-col gap-1">
        <h2
          id="class-performance"
          className="font-heading text-heading font-semibold"
        >
          Desempenho da turma
        </h2>
        <p className="text-muted-foreground text-sm">
          Nota média dos alunos ativos em cada tipo de missão.
        </p>
      </header>

      <Card className="border-border bg-card">
        <CardContent>
          {/* Recomeça ao trocar de turma: filtro em "Tudo" e sem mostrar a
              média da turma anterior enquanto a nova carrega. */}
          <PerformanceRadar
            key={classId}
            studentId={studentId}
            subject="class"
          />
        </CardContent>
      </Card>
    </section>
  );
}
