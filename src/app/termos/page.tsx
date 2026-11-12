import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection, LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Termos de uso",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Termos de uso"
      summary="Regras de uso do LevelUp English para alunos, professores e escolas."
    >
      <LegalSection title="1. O que é a plataforma">
        <p>
          O LevelUp English é uma plataforma gamificada de apoio ao ensino de
          inglês. Alunos fazem missões, ganham XP, sobem de nível e aparecem em
          rankings; professores criam missões e reconhecem atitudes em sala; a
          escola administra turmas, professores e alunos.
        </p>
      </LegalSection>

      <LegalSection title="2. Contas">
        <ul>
          <li>
            Não há cadastro aberto: as contas são criadas pela escola ou pelo
            professor.
          </li>
          <li>
            A conta de um aluno só é criada depois que a escola recebe o{" "}
            <Link href="/termo-responsaveis">
              termo de consentimento assinado pelos responsáveis
            </Link>
            .
          </li>
          <li>
            A senha é pessoal. Quem perceber uso indevido da própria conta deve
            trocar a senha e avisar a escola.
          </li>
          <li>
            A escola pode desativar uma conta a qualquer momento; o histórico de
            XP é preservado conforme a{" "}
            <Link href="/privacidade">política de privacidade</Link>.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Uso adequado">
        <p>Ao usar a plataforma, o usuário se compromete a:</p>
        <ul>
          <li>
            responder às missões por conta própria, sem tentar burlar a correção
            ou o cálculo de XP;
          </li>
          <li>
            usar uma foto de perfil adequada ao ambiente escolar, sem imagens de
            outras pessoas sem autorização;
          </li>
          <li>
            não tentar acessar dados de outros usuários nem áreas reservadas a
            outros papéis.
          </li>
        </ul>
        <p>O descumprimento pode levar à desativação da conta pela escola.</p>
      </LegalSection>

      <LegalSection title="4. Responsabilidades">
        <ul>
          <li>
            A <strong>escola</strong> responde pelo conteúdo das missões, pelas
            atitudes registradas e pela guarda dos termos assinados.
          </li>
          <li>
            O <strong>professor</strong> responde pelos registros feitos nas
            próprias turmas.
          </li>
          <li>
            A <strong>plataforma</strong> se esforça para manter o serviço no ar
            e os dados seguros, mas pode passar por interrupções para
            manutenção.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Dados pessoais">
        <p>
          O tratamento de dados segue a{" "}
          <Link href="/privacidade">política de privacidade</Link>, que explica
          quais dados são guardados, por quanto tempo e como exercer os direitos
          previstos na LGPD.
        </p>
      </LegalSection>

      <LegalSection title="6. Mudanças nestes termos">
        <p>
          Estes termos podem mudar. A data da última atualização fica no topo da
          página, e mudanças importantes serão comunicadas pela escola.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
