import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection, LegalShell } from "@/components/legal/legal-shell";
import {
  BACKUP_KEEP_DAYS,
  NOTIFICATION_DAYS,
  RETENTION_MONTHS,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de privacidade",
};

const collectedData = [
  {
    data: "Nome",
    purpose:
      "Identificar o aluno para a escola e para o professor e mostrá-lo nos rankings.",
  },
  {
    data: "E-mail",
    purpose:
      "Entrar na plataforma, criar e recuperar a senha. Não é mostrado a outros alunos.",
  },
  {
    data: "Foto de perfil (opcional)",
    purpose:
      "Personalizar o perfil. É convertida para WebP e perde os metadados (como local e aparelho) no envio.",
  },
  {
    data: "Desempenho nas missões",
    purpose:
      "Corrigir as respostas, mostrar o progresso ao aluno e a média da turma ao professor.",
  },
  {
    data: "XP, nível e histórico de XP",
    purpose:
      "Gamificação: mostrar a evolução do aluno e de onde veio cada ponto.",
  },
  {
    data: "Atitudes registradas pelo professor",
    purpose:
      "Reconhecer comportamentos em sala (positivos ou negativos) com XP.",
  },
  {
    data: "Posição nos rankings",
    purpose:
      "Incentivo pela comparação com a turma e com a escola. O aluno pode sair do ranking geral e o professor pode ocultar o ranking da turma.",
  },
  {
    data: "Notificações",
    purpose: `Avisar o aluno sobre XP recebido e novas missões. São apagadas após ${NOTIFICATION_DAYS} dias.`,
  },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Política de privacidade"
      summary="Quais dados do aluno o LevelUp English guarda, por que, por quanto tempo e como exercer os seus direitos pela LGPD (Lei 13.709/2018)."
    >
      <LegalSection title="1. Quem cuida dos dados">
        <p>
          A <strong>escola</strong> (ou o professor responsável pelo curso) é a{" "}
          <strong>controladora</strong> dos dados: é ela quem decide cadastrar o
          aluno, em qual turma e para quê. O <strong>LevelUp English</strong> é
          a ferramenta usada pela escola e atua como <strong>operador</strong>:
          trata os dados só para fazer a plataforma funcionar, conforme as
          instruções da escola.
        </p>
        <p>
          Não existe cadastro aberto. Toda conta de aluno é criada pela escola
          ou pelo professor, depois de a escola receber o{" "}
          <Link href="/termo-responsaveis">
            termo de consentimento assinado pelos responsáveis
          </Link>{" "}
          (art. 14 da LGPD, para crianças e adolescentes).
        </p>
      </LegalSection>

      <LegalSection title="2. Dados coletados e finalidade">
        <table>
          <thead>
            <tr>
              <th scope="col">Dado</th>
              <th scope="col">Para que serve</th>
            </tr>
          </thead>
          <tbody>
            {collectedData.map((item) => (
              <tr key={item.data}>
                <td className="font-medium">{item.data}</td>
                <td>{item.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          A plataforma não usa os dados para publicidade, não os vende e não os
          compartilha com terceiros além do necessário para hospedar o serviço e
          enviar e-mails de acesso.
        </p>
      </LegalSection>

      <LegalSection title="3. Quem vê o quê">
        <ul>
          <li>
            O <strong>aluno</strong> vê o próprio perfil, o próprio histórico e
            os rankings em que aparece.
          </li>
          <li>
            O <strong>professor</strong> vê apenas os alunos das próprias
            turmas.
          </li>
          <li>
            A <strong>escola (admin)</strong> vê todos os alunos e é quem atende
            os pedidos dos titulares.
          </li>
          <li>
            Nos rankings aparecem só nome, foto, nível e XP — nunca o e-mail.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Por quanto tempo os dados ficam guardados">
        <ul>
          <li>
            Enquanto a conta está <strong>ativa</strong>, os dados ficam
            guardados para o uso normal da plataforma.
          </li>
          <li>
            Quando a conta é <strong>desativada</strong> (fim do curso,
            transferência ou revogação do consentimento), os dados ficam
            guardados por até <strong>{RETENTION_MONTHS} meses</strong>, para o
            caso de o aluno voltar.
          </li>
          <li>
            Vencido esse prazo, o aluno é <strong>anonimizado</strong>: o nome
            vira “Aluno removido”, o e-mail é trocado por um endereço fictício,
            a foto é apagada do disco e as notificações e chaves de acesso são
            excluídas. O XP e o progresso continuam ligados ao registro anônimo,
            apenas para não alterar os rankings e as médias da turma.
          </li>
          <li>
            As cópias de segurança (backups) são guardadas por{" "}
            <strong>{BACKUP_KEEP_DAYS} dias</strong>. Por isso, um dado
            eliminado pode continuar existindo em um backup por até{" "}
            {BACKUP_KEEP_DAYS} dias, até a cópia ser substituída.
          </li>
          <li>Notificações são apagadas após {NOTIFICATION_DAYS} dias.</li>
        </ul>
      </LegalSection>

      <LegalSection id="direitos" title="5. Direitos do titular (art. 18)">
        <p>
          O aluno e os responsáveis por ele podem pedir à escola, a qualquer
          momento:
        </p>
        <ol>
          <li>a confirmação de que a plataforma trata os dados do aluno;</li>
          <li>
            o <strong>acesso</strong> aos dados — a escola exporta tudo o que
            está guardado em um arquivo;
          </li>
          <li>a correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>
            a anonimização, o bloqueio ou a eliminação de dados desnecessários
            ou excessivos;
          </li>
          <li>a portabilidade dos dados, no mesmo arquivo exportado;</li>
          <li>
            a <strong>eliminação</strong> dos dados tratados com o consentimento
            — a escola anonimiza o aluno na hora, sem volta;
          </li>
          <li>a informação sobre com quem os dados foram compartilhados;</li>
          <li>
            a informação sobre a possibilidade de não dar o consentimento e suas
            consequências (sem ele, a conta não é criada);
          </li>
          <li>a revogação do consentimento.</li>
        </ol>
        <p>
          <strong>Como pedir:</strong> procure a secretaria da escola ou o
          professor responsável pela turma. Os pedidos são atendidos pelo
          administrador da escola na própria plataforma, sem custo.
        </p>
      </LegalSection>

      <LegalSection id="revogacao" title="6. Como revogar o consentimento">
        <p>
          Os responsáveis podem revogar o consentimento a qualquer momento,
          avisando a escola ou o professor. A revogação{" "}
          <strong>desativa a conta do aluno imediatamente</strong>: ele deixa de
          entrar na plataforma e sai dos rankings. Os dados passam a seguir o
          prazo de retenção do item 4. Se quiserem que os dados sejam apagados
          antes, basta pedir também a eliminação (item 5).
        </p>
      </LegalSection>

      <LegalSection title="7. Segurança">
        <p>
          As senhas são guardadas cifradas, o acesso exige login e cada papel só
          vê o que precisa. Mesmo assim, nenhum sistema é totalmente imune a
          falhas; se acontecer um incidente que possa causar risco aos alunos, a
          escola será avisada para tomar as medidas previstas na LGPD.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
