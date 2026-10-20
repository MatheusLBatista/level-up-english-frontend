# Plano de testes — LevelUp English (frontend)

| Item            | Valor                                         |
| --------------- | --------------------------------------------- |
| Sistema         | LevelUp English — interface web (Next.js)     |
| Tipo de teste   | Ponta a ponta (E2E), automatizado com Cypress |
| Versão          | 1.0 — cobre autenticação e as telas do aluno  |
| Última execução | 19/10/2026 — 45 casos, 45 aprovados           |

## 1. Objetivo

Verificar, do ponto de vista de quem usa o sistema, que os fluxos principais da
plataforma funcionam de ponta a ponta: a tela no navegador, as regras do
frontend e a comunicação com a API. Os testes servem também como teste de
regressão: rodam a cada mudança para garantir que o que já funcionava continua
funcionando.

## 2. Escopo

### 2.1 Dentro do escopo

| Área                 | O que é testado                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| Autenticação         | Login dos três papéis, validação do formulário, credenciais inválidas, conta desativada                        |
| Recuperação de senha | "Esqueci minha senha", nova senha por link e criação de senha no primeiro acesso                               |
| Sessão               | Rotas protegidas, sessão mantida ao recarregar, logout, renovação do token, sessão encerrada pela API          |
| Aluno — Dashboard    | Saudação, XP, nível, contagem de missões, próxima missão, recomendadas, histórico de XP, anotação do professor |
| Aluno — Missões      | Listagem e filtro, resolução de quiz e vocabulário, rascunho, saída, refazer, erros                            |
| Aluno — Ranking      | Ranking da turma e geral, ordem, destaque do aluno, escolha guardada na URL                                    |
| Aluno — Perfil       | Dados, turma, conquistas, edição do nome e troca de senha                                                      |

### 2.2 Fora do escopo (nesta versão)

- Telas do professor e do admin — planejadas para as próximas versões (seção 11).
- Testes unitários de funções isoladas e testes de componente.
- Testes do backend — o repositório da API tem a própria suíte (Jest).
- Desempenho, carga e segurança.
- Layout no celular e outros navegadores além do usado pelo Cypress.

## 3. Estratégia

### 3.1 Tipo de teste

Todos os casos são **testes ponta a ponta**: o Cypress abre a aplicação num
navegador real, clica, digita e confere o que aparece na tela, como um usuário
faria. Os elementos são encontrados pelo texto visível, pelo `id` dos campos e
pelos papéis de acessibilidade (`role="alert"`, `role="dialog"`), nunca por
classes CSS, para que mudanças visuais não quebrem os testes.

### 3.2 Testes integrados e testes com API simulada

Os casos se dividem em dois grupos, indicados na coluna **Modo** das tabelas
da seção 7:

| Modo          | Como funciona                                                                            | Quando é usado                                                                                                                                                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Integrado** | O frontend conversa com o backend real, rodando localmente com os dados de demonstração. | Fluxos que só leem dados ou que não alteram o banco: login, listagens, ranking, erros reais da API.                                                                                                                                         |
| **Simulado**  | O Cypress intercepta a requisição (`cy.intercept`) e devolve uma resposta preparada.     | Quando a chamada real mudaria os dados da demonstração (entregar missão, trocar nome ou senha), dependeria de algo externo (e-mail de recuperação) ou exigiria um estado difícil de reproduzir (erro 500, conta desativada no meio do uso). |

Mesmo nos testes simulados, o caso confere **o que o frontend enviou** para a
API (o corpo da requisição), e não só a tela.

### 3.3 Dados de teste independentes de IDs

Os identificadores de missões e usuários mudam toda vez que o banco é
recriado. Por isso, os testes não guardam IDs fixos: antes de começar, buscam
na API os dados de que precisam (as missões da turma, o progresso do aluno, o
ranking) e calculam o resultado esperado a partir deles.

## 4. Ambiente

| Componente | Versão / configuração                                              |
| ---------- | ------------------------------------------------------------------ |
| Cypress    | 16.2.0                                                             |
| Navegador  | Electron (padrão do `cypress run`) ou Chrome (`cypress open`)      |
| Tela       | 1280 × 800 (sidebar aberta)                                        |
| Frontend   | Next.js 16.3.2 em modo de desenvolvimento, `http://localhost:3000` |
| Backend    | LevelUp English API local, `http://localhost:5011`                 |
| Banco      | MongoDB local, populado com `npm run seed:demo` no backend         |
| Node.js    | ≥ 20.9                                                             |

A configuração fica em `cypress.config.ts`. A URL da API usada pelos testes
(`expose.apiUrl`) precisa ser a mesma do `NEXT_PUBLIC_API_URL` do `.env.local`.

## 5. Massa de dados

Os usuários vêm do seed de demonstração do backend (`npm run seed:demo`), todos
com a senha `Senha@123`, e estão em `cypress/fixtures/users.json`.

| Papel nos testes    | Usuário                             | Por que foi escolhido                                                               |
| ------------------- | ----------------------------------- | ----------------------------------------------------------------------------------- |
| Aluno com histórico | `ana.ferreira@levelup.edu.br`       | Aluna destaque: tem XP, histórico, missões com nota máxima e outras abaixo de 100%. |
| Aluno novo          | `arthur.nascimento@levelup.edu.br`  | Entrou na turma há pouco: nenhuma missão feita e XP zerado.                         |
| Professor           | `carla.mendes@levelup.edu.br`       | Professora com turmas.                                                              |
| Admin               | `renata.albuquerque@levelup.edu.br` | Coordenação da escola.                                                              |
| Conta desativada    | `nicolas.pinto@levelup.edu.br`      | Aluno que o seed desativa.                                                          |

**Cuidado:** os testes contam com o Arthur sem nenhuma missão feita. Ele não
deve ser usado em demonstrações; se resolver missões com ele, rode o
`seed:demo` de novo.

## 6. Como executar

1. No backend: `npm run seed:demo` (só na primeira vez ou para restaurar os
   dados) e `npm run dev`.
2. No frontend: `npm run dev`.
3. Em outro terminal, no frontend:

| Comando                                           | O que faz                                                        |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| `npm run cy:open`                                 | Abre a interface do Cypress para escolher e assistir aos testes. |
| `npm run cy:run`                                  | Roda todos os testes no terminal.                                |
| `npx cypress run --spec "cypress/e2e/student/**"` | Roda só uma pasta.                                               |
| `npx cypress run --headed --browser chrome`       | Roda tudo mostrando o Chrome.                                    |

## 7. Casos de teste

Legenda do **Modo**: **I** = integrado (backend real) · **S** = API simulada ·
**I+S** = parte real, parte simulada.

### 7.1 Login — `cypress/e2e/auth/login.cy.ts`

| ID        | Caso                    | Modo | Resultado esperado                                                                              |
| --------- | ----------------------- | ---- | ----------------------------------------------------------------------------------------------- |
| CT-LOG-01 | Login do aluno          | I    | API responde 200, aluno vai para `/dashboard` e a sessão é gravada no navegador.                |
| CT-LOG-02 | Login do professor      | I    | Professor vai para `/painel`.                                                                   |
| CT-LOG-03 | Login do admin          | I    | Admin vai para `/turmas`.                                                                       |
| CT-LOG-04 | Validação do formulário | I    | E-mail inválido e senha com menos de 6 caracteres mostram erro, e nenhuma requisição é enviada. |
| CT-LOG-05 | Credenciais inválidas   | I    | API responde 401 e aparece "Credenciais inválidas"; o usuário continua no `/login`.             |
| CT-LOG-06 | Conta desativada        | I    | Com a senha certa de uma conta desativada, aparece "Conta bloqueada".                           |

O CT-LOG-05 usa um e-mail diferente a cada execução, porque o backend bloqueia
10 tentativas erradas em 15 minutos para o mesmo IP e e-mail.

### 7.2 Recuperação de senha — `cypress/e2e/auth/password-recovery.cy.ts`

| ID        | Caso                                     | Modo | Resultado esperado                                                                |
| --------- | ---------------------------------------- | ---- | --------------------------------------------------------------------------------- |
| CT-REC-01 | E-mail inválido em "Esqueci minha senha" | S    | Mostra "Informe um email válido" sem chamar a API.                                |
| CT-REC-02 | Pedido de link                           | S    | Envia o e-mail normalizado (sem espaços, minúsculo) e confirma o envio na tela.   |
| CT-REC-03 | Voltar para o login                      | S    | O link leva para `/login`.                                                        |
| CT-REC-04 | Link sem código                          | S    | `/reset-password` sem `?code=` avisa que o link é inválido e oferece pedir outro. |
| CT-REC-05 | Senhas diferentes                        | S    | Mostra "As senhas não conferem." sem chamar a API.                                |
| CT-REC-06 | Código expirado                          | S    | Quando a API recusa o código, a tela avisa que o link expirou.                    |
| CT-REC-07 | Nova senha salva                         | S    | Envia `{ code, newPassword }`, confirma e leva para o login.                      |
| CT-REC-08 | Primeiro acesso                          | S    | `/set-password` mostra "Crie sua senha" e as boas-vindas, e usa o mesmo envio.    |

Toda a recuperação é simulada: o fluxo real envia e-mail pelo Gmail (com limite
de 5 pedidos por hora) e o código só existe dentro do e-mail.

### 7.3 Sessão — `cypress/e2e/auth/session.cy.ts`

| ID        | Caso                           | Modo | Resultado esperado                                                                                                                        |
| --------- | ------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| CT-SES-01 | Rota protegida sem sessão      | I    | Abrir `/dashboard` sem login leva para `/login`.                                                                                          |
| CT-SES-02 | Recarregar a página logado     | I    | A sessão continua; abrir `/login` logado leva de volta ao dashboard.                                                                      |
| CT-SES-03 | Sair                           | I    | "Sair" leva ao login e apaga a sessão do navegador.                                                                                       |
| CT-SES-04 | Token vencido com renovação    | I    | A API recusa o token, o frontend renova uma única vez (mesmo com várias telas pedindo dados ao mesmo tempo) e o usuário continua na tela. |
| CT-SES-05 | Renovação recusada             | I    | Sem renovação possível, volta ao login com "Sua sessão expirou".                                                                          |
| CT-SES-06 | Conta desativada durante o uso | S    | A API responde 403 "Conta bloqueada"; o usuário volta ao login com o aviso de conta desativada.                                           |

### 7.4 Aluno — Dashboard — `cypress/e2e/student/dashboard.cy.ts`

| ID        | Caso                          | Modo | Resultado esperado                                                                                       |
| --------- | ----------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| CT-DSH-01 | Resumo do aluno               | I    | "Oi, Ana!", XP total, nível, XP para o próximo nível, missões para fazer e completas, iguais aos da API. |
| CT-DSH-02 | Próxima missão e recomendadas | I    | "Melhorar a nota" e os cards recomendados (até 3) levam só a missões que ainda rendem XP.                |
| CT-DSH-03 | Ver todas                     | I    | Leva para `/missoes`.                                                                                    |
| CT-DSH-04 | Histórico de XP               | I    | Total de registros, itens e paginação (página 1 → 2) iguais aos da API.                                  |
| CT-DSH-05 | Anotação do professor         | I    | Mostra a anotação mais recente do professor; "Ver histórico" leva até a seção.                           |
| CT-DSH-06 | Aluno novo                    | I    | Mostra "Próxima missão" e "Começar missão", XP zerado, histórico vazio e o professor da turma.           |

### 7.5 Aluno — Missões — `cypress/e2e/student/mission.cy.ts`

| ID        | Caso                    | Modo | Resultado esperado                                                                                                                                                       |
| --------- | ----------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CT-MIS-01 | Listar e filtrar        | I    | Todas as missões da turma aparecem; o filtro "Quiz" muda a URL para `?tipo=quiz` e esconde os outros tipos.                                                              |
| CT-MIS-02 | Resolver um quiz        | I+S  | Responde todas as questões, envia `{ done, answers }` e mostra XP ganho, acertos, nota e subida de nível.                                                                |
| CT-MIS-03 | Falha ao entregar       | I+S  | Com erro 500, aparece "Suas respostas continuam aqui", nada se perde e dá para tentar de novo.                                                                           |
| CT-MIS-04 | Material de vocabulário | I    | A missão abre no material ("Estude antes de responder"); as perguntas vêm depois, e dá para voltar ao material.                                                          |
| CT-MIS-05 | Questões em branco      | I    | "Entregar" fica desabilitado e a tela lista as questões que faltam, com atalho para cada uma.                                                                            |
| CT-MIS-06 | Rascunho                | I    | Depois de recarregar a página, as respostas e a questão atual continuam lá.                                                                                              |
| CT-MIS-07 | Sair no meio            | I    | Pede confirmação; "Continuar a missão" mantém o aluno, "Sair" volta à lista com a missão marcada como "Continuar".                                                       |
| CT-MIS-08 | Missão de outra turma   | I    | API responde 403 e a tela mostra "Esta missão é de outra turma."                                                                                                         |
| CT-MIS-09 | Missão inexistente      | I    | API responde 404 e a tela mostra "Não encontramos esta missão".                                                                                                          |
| CT-MIS-10 | Missão com nota máxima  | I    | Mostra "Missão concluída" e não deixa refazer.                                                                                                                           |
| CT-MIS-11 | Refazer abaixo de 100%  | I+S  | Mostra a melhor nota e quanto XP ainda dá para ganhar; se a nova tentativa não supera a melhor, mostra "0 XP" e "Nenhum XP novo"; "Tentar de novo" recomeça do material. |

As entregas são simuladas para não mudar o XP nem o progresso dos alunos da
demonstração.

### 7.6 Aluno — Ranking — `cypress/e2e/student/ranking.cy.ts`

| ID        | Caso             | Modo | Resultado esperado                                                                                                         |
| --------- | ---------------- | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| CT-RNK-01 | Ranking da turma | I    | Abre na turma, com o nome da turma, as posições na mesma ordem da API, "1º lugar" no primeiro e "Você" na linha do aluno.  |
| CT-RNK-02 | Ranking geral    | I    | "Geral" muda a URL para `?escopo=global` e mostra o ranking geral; a escolha continua depois de recarregar; "Turma" volta. |

### 7.7 Aluno — Perfil — `cypress/e2e/student/profile.cy.ts`

| ID        | Caso                        | Modo | Resultado esperado                                                                                                  |
| --------- | --------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------- |
| CT-PRF-01 | Dados do perfil             | I    | Nome, e-mail, nível, XP (formato brasileiro), turma, posição na turma, missões concluídas e conquista desbloqueada. |
| CT-PRF-02 | Nome curto                  | S    | "O nome precisa ter ao menos 3 caracteres." sem chamar a API.                                                       |
| CT-PRF-03 | Editar nome                 | S    | Envia o nome novo, fecha o diálogo e atualiza a tela e a sessão no navegador.                                       |
| CT-PRF-04 | Validação da troca de senha | S    | Nova senha igual à atual e confirmação diferente são barradas sem chamar a API.                                     |
| CT-PRF-05 | Senha atual errada          | I    | API responde 400, aparece "Senha atual incorreta." e o usuário **continua logado**.                                 |
| CT-PRF-06 | Troca de senha              | S    | Envia `{ currentPassword, newPassword }` e mostra "Senha alterada com sucesso."                                     |

## 8. Critérios

| Critério                 | Definição                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Entrada**              | Backend e frontend rodando localmente; banco com o `seed:demo`; `npm run typecheck` e `npm run lint` sem erros.                            |
| **Aprovação de um caso** | Todas as verificações do caso passam dentro do tempo limite (10 s por comando).                                                            |
| **Saída**                | 100% dos casos aprovados. Um caso que falha bloqueia o merge da branch até ser corrigido o sistema ou, se a regra mudou, o próprio teste.  |
| **Suspensão**            | Backend fora do ar, ou banco sem os dados de demonstração: a execução é interrompida, porque as falhas não indicariam defeito no frontend. |

## 9. Resultados da execução

Execução de 19/10/2026, ambiente da seção 4:

| Suíte                | Arquivo                        |  Casos | Aprovados | Falhas |
| -------------------- | ------------------------------ | -----: | --------: | -----: |
| Login                | `auth/login.cy.ts`             |      6 |         6 |      0 |
| Recuperação de senha | `auth/password-recovery.cy.ts` |      8 |         8 |      0 |
| Sessão               | `auth/session.cy.ts`           |      6 |         6 |      0 |
| Dashboard            | `student/dashboard.cy.ts`      |      6 |         6 |      0 |
| Missões              | `student/mission.cy.ts`        |     11 |        11 |      0 |
| Perfil               | `student/profile.cy.ts`        |      6 |         6 |      0 |
| Ranking              | `student/ranking.cy.ts`        |      2 |         2 |      0 |
| **Total**            |                                | **45** |    **45** |  **0** |

Tempo total: cerca de 40 segundos.

## 10. Defeitos encontrados

| ID     | Defeito                                                                                                                                                                                                                                                                   | Como foi encontrado                                                                          | Situação                                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| DEF-01 | **A sessão não era renovada quando o token vencia.** O backend responde **498** para token inválido ou expirado, mas o frontend só tentava renovar no **401**. Na prática, depois de 1 dia (validade do token), o aluno via as telas com erro e não era mandado ao login. | CT-SES-04 e CT-SES-05 falharam na primeira execução: nenhuma chamada de renovação acontecia. | Corrigido em `src/lib/api.ts` (`isSessionRejected` aceita 401 e 498) e documentado em `docs/api.md`. Os dois casos passam desde então. |

O CT-PRF-05 cobre um defeito corrigido antes da criação dos testes (errar a
senha atual em "Alterar senha" encerrava a sessão) e garante que ele não volte.

## 11. Riscos, limitações e próximos passos

**Riscos e limitações**

- Os testes integrados dependem dos dados do `seed:demo`. Se os dados mudarem
  (por exemplo, o Arthur resolver missões), alguns casos falham sem que haja
  defeito; a solução é rodar o seed de novo.
- Os testes rodam só em tela de computador (1280 × 800) e num único navegador.
- O frontend roda em modo de desenvolvimento; a primeira abertura de cada tela é
  mais lenta, por isso o tempo limite por comando é de 10 s.

**Próximos passos**

| Versão | Escopo planejado                                                                                               | Pasta                  |
| ------ | -------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1.1    | Professor: painel (aplicar atitudes, ajustar XP, cadastrar aluno), missões (criar, editar, desativar) e perfil | `cypress/e2e/teacher/` |
| 1.2    | Admin: turmas, alunos, professores e atitudes                                                                  | `cypress/e2e/admin/`   |
