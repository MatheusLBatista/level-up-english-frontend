import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/legal/legal-shell";
import { PrintButton } from "@/components/legal/print-button";
import {
  BACKUP_KEEP_DAYS,
  NOTIFICATION_DAYS,
  RETENTION_MONTHS,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Termo de consentimento dos responsáveis",
};

/** Linha em branco para preencher à mão no papel. */
function Blank({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span aria-hidden className="border-foreground block h-8 border-b" />
      <span className="text-muted-foreground text-xs print:text-black">
        {label}
      </span>
    </div>
  );
}

export default function GuardianConsentPage() {
  return (
    <LegalShell
      title="Termo de consentimento dos responsáveis"
      summary="Modelo para imprimir, preencher e entregar à escola antes da criação da conta do aluno (art. 14 da LGPD)."
      actions={<PrintButton />}
    >
      <LegalSection title="Identificação">
        <div className="grid gap-4 sm:grid-cols-2">
          <Blank label="Nome completo do aluno" />
          <Blank label="Turma" />
          <Blank label="Nome completo do responsável legal" />
          <Blank label="CPF ou documento do responsável" />
          <Blank label="Grau de parentesco ou relação" />
          <Blank label="Telefone ou e-mail para contato" />
        </div>
      </LegalSection>

      <LegalSection title="Consentimento">
        <p>
          Eu, responsável legal pelo aluno acima, autorizo a escola a
          cadastrá-lo na plataforma LevelUp English e a tratar os dados pessoais
          dele para as finalidades abaixo, conforme a Lei Geral de Proteção de
          Dados Pessoais (Lei 13.709/2018, art. 14).
        </p>
      </LegalSection>

      <LegalSection title="Quais dados e para quê">
        <ul>
          <li>
            <strong>Nome e e-mail:</strong> identificar o aluno e permitir o
            acesso à plataforma.
          </li>
          <li>
            <strong>Foto de perfil (opcional):</strong> personalizar o perfil;
            enviada só se o aluno quiser.
          </li>
          <li>
            <strong>Desempenho nas missões, XP, nível e histórico:</strong>
            acompanhar a evolução no inglês.
          </li>
          <li>
            <strong>Atitudes registradas pelo professor:</strong> reconhecer
            comportamentos em sala.
          </li>
          <li>
            <strong>Posição nos rankings:</strong> incentivo pela comparação com
            a turma e com a escola. Nos rankings aparecem só nome, foto, nível e
            XP.
          </li>
          <li>
            <strong>Notificações:</strong> avisos sobre XP e missões, apagados
            após {NOTIFICATION_DAYS} dias.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Controlador, prazo e direitos">
        <ul>
          <li>
            A escola é a controladora dos dados; a plataforma LevelUp English
            atua como operadora, seguindo as instruções da escola.
          </li>
          <li>
            Os dados ficam guardados enquanto a conta estiver ativa e por até{" "}
            {RETENTION_MONTHS} meses depois da desativação. Depois disso, o
            aluno é anonimizado. Cópias de segurança são mantidas por até{" "}
            {BACKUP_KEEP_DAYS} dias.
          </li>
          <li>
            A qualquer momento, posso pedir à escola acesso, correção, cópia ou
            eliminação dos dados do aluno, sem custo.
          </li>
          <li>
            Posso <strong>revogar este consentimento</strong> a qualquer
            momento, avisando a escola. A conta do aluno será desativada na
            hora.
          </li>
          <li>
            Sei que posso não consentir; nesse caso, a conta do aluno não será
            criada.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Assinatura">
        <div className="grid gap-6 pt-4 sm:grid-cols-2">
          <Blank label="Local e data" />
          <Blank label="Assinatura do responsável legal" />
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Blank label="Recebido pela escola em (data)" />
          <Blank label="Nome de quem recebeu" />
        </div>
      </LegalSection>
    </LegalShell>
  );
}
