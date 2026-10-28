# Plano de testes — LevelUp English (frontend)

| Item            | Valor                                              |
| --------------- | -------------------------------------------------- |
| Sistema         | LevelUp English — interface web (Next.js)          |
| Tipo de teste   | Ponta a ponta (E2E), automatizado com Cypress      |
| Versão          | 1.4 — autenticação, aluno, professor, admin e tema |
| Última execução | 22/10/2026 — 108 casos, 108 aprovados              |

## 1. Objetivo

Verificar, do ponto de vista de quem usa o sistema, que os fluxos principais da
plataforma funcionam de ponta a ponta: a tela no navegador, as regras do
frontend e a comunicação com a API. Os testes servem também como teste de
regressão: rodam a cada mudança para garantir que o que já funcionava continua
funcionando.

## 2. Escopo

### 2.1 Dentro do escopo

| Área                 | O que é testado                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Autenticação         | Login dos três papéis, validação do formulário, credenciais inválidas, conta desativada                                                        |
| Recuperação de senha | "Esqueci minha senha", nova senha por link e criação de senha no primeiro acesso                                                               |
| Sessão               | Rotas protegidas, sessão mantida ao recarregar, logout, renovação do token, sessão encerrada pela API                                          |
| Aluno — Dashboard    | Saudação, XP, nível, contagem de missões, próxima missão, recomendadas, histórico de XP, anotação do professor                                 |
| Aluno — Missões      | Listagem e filtro, resolução de quiz e vocabulário, rascunho, saída, refazer, erros                                                            |
| Aluno — Ranking      | Ranking da turma e geral, ordem, destaque do aluno, escolha guardada na URL                                                                    |
| Aluno — Perfil       | Dados, turma, conquistas, edição do nome e troca de senha                                                                                      |
| Professor — Painel   | Alunos da turma, pesquisa, seleção, ficha do aluno, aplicar e desfazer atitudes, ajustar XP, cadastrar aluno, acesso às telas de outros papéis |
| Professor — Missões  | Listagem, paginação e filtro, criação com validação por tipo, edição, desativação e reativação                                                 |
| Professor — Ranking  | Ranking da turma escolhida no seletor e ranking geral                                                                                          |
| Professor — Perfil   | Crachá, turmas com atalhos e atividade recente                                                                                                 |
| Admin — Turmas       | Listagem, busca, filtro por status, criação com validação, nome repetido, edição, desativação e reativação                                     |
| Admin — Alunos       | Listagem paginada, busca, filtro por turma, inativos, perfil, edição, desativação e cadastro sem turma                                         |
| Admin — Professores  | Listagem com turmas, busca, desativados, cadastro, edição das turmas, aviso de turmas sem professor ao desativar                               |
| Admin — Atitudes     | Listagem com XP com sinal, desativadas, criação de punição com prévia, edição e desativação                                                    |
| Tema claro e escuro  | Tema do aparelho na primeira visita, botão no login e no cabeçalho, escolha guardada e mantida ao recarregar                                   |

### 2.2 Fora do escopo (nesta versão)

- Aparência de cada tema: os testes conferem qual tema está ativo, não as cores
  nem o contraste (verificados à parte, ver seção 11).
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

| Modo          | Como funciona                                                                            | Quando é usado                                                                                                                                                                                                                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Integrado** | O frontend conversa com o backend real, rodando localmente com os dados de demonstração. | Fluxos que só leem dados ou que não alteram o banco: login, listagens, ranking, erros reais da API.                                                                                                                                                                                                                                            |
| **Simulado**  | O Cypress intercepta a requisição (`cy.intercept`) e devolve uma resposta preparada.     | Quando a chamada real mudaria os dados da demonstração (entregar missão, trocar nome ou senha, aplicar atitude, ajustar XP, cadastrar aluno, criar ou editar missão, turma, professor ou atitude), dependeria de algo externo (e-mail de recuperação) ou exigiria um estado difícil de reproduzir (erro 500, conta desativada no meio do uso). |

Mesmo nos testes simulados, o caso confere **o que o frontend enviou** para a
API (o corpo da requisição), e não só a tela.

### 3.3 Dados de teste independentes de IDs

Os identificadores de missões e usuários mudam toda vez que o banco é
recriado. Por isso, os testes não guardam IDs fixos: antes de começar, buscam
na API os dados de que precisam (as missões da turma, o progresso do aluno, o
ranking) e calculam o resultado esperado a partir deles.

### 3.4 Tema do aparelho simulado

O tema da primeira visita vem da preferência do aparelho
(`prefers-color-scheme`), que o navegador do Cypress não deixa trocar. Os casos
de tema substituem o `window.matchMedia` antes de a página carregar e escolhem
se o "aparelho" está no tema claro ou no escuro. Assim o teste vale em qualquer
navegador.

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
| Professor           | `carla.mendes@levelup.edu.br`       | Professora do 1º Ano A: 8 alunos e as 7 missões da turma, todas criadas por ela.    |
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
| CT-PRF-07 | Foto inválida               | S    | Arquivo que não é JPEG, PNG ou WebP, ou acima de 2 MB, mostra o erro e não chama a API.                             |
| CT-PRF-08 | Enviar foto                 | S    | Mostra a prévia, envia `multipart/form-data` e atualiza perfil, cabeçalho e sessão, mantendo o e-mail.              |
| CT-PRF-09 | Erro ao enviar foto         | S    | A mensagem do servidor aparece e o diálogo continua aberto.                                                         |
| CT-PRF-10 | Remover foto                | S    | Chama `DELETE /users/:id/avatar` e o avatar volta para as iniciais.                                                 |

### 7.8 Professor — Painel — `cypress/e2e/teacher/panel.cy.ts`

| ID        | Caso                               | Modo | Resultado esperado                                                                                                                                                                 |
| --------- | ---------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CT-PNL-01 | Alunos da turma                    | I    | A turma aparece no seletor e a grade mostra os mesmos alunos da API, com nível e XP.                                                                                               |
| CT-PNL-02 | Pesquisa                           | I    | A pesquisa ignora maiúsculas e acentos; sem resultado, mostra "Nenhum aluno encontrado".                                                                                           |
| CT-PNL-03 | Seleção                            | I    | Sem seleção, as ações ficam desabilitadas; marca um a um, "Selecionar todos" e "Limpar" atualizam a contagem.                                                                      |
| CT-PNL-04 | Ficha do aluno                     | I    | "Ver ficha" abre o painel lateral com nome, nível e histórico de XP.                                                                                                               |
| CT-PNL-05 | Aplicar atitudes e desfazer        | I+S  | Duas atitudes para dois alunos geram quatro envios (um por aluno e atitude), o resumo mostra o XP por aluno, "Desfazer" apaga os quatro registros e, ao fechar, a seleção é limpa. |
| CT-PNL-06 | Falha parcial                      | I+S  | Se a API recusa um dos alunos, a tela mostra "1 de 2 aplicadas" e o motivo ao lado do nome.                                                                                        |
| CT-PNL-07 | Ajuste sem quantidade              | I    | Mostra "Informe a quantidade de XP." sem chamar a API.                                                                                                                             |
| CT-PNL-08 | Adicionar XP                       | I+S  | Envia `{ student, amount, reason }` para cada aluno marcado e confirma "+50 XP por aluno".                                                                                         |
| CT-PNL-09 | Remover mais XP do que o aluno tem | I+S  | Antes de confirmar, avisa que o XP vai parar em 0; depois, mostra quanto foi removido de fato.                                                                                     |
| CT-PNL-10 | Validação do novo aluno            | I    | Nome com 1 letra e e-mail inválido são barrados sem chamar a API.                                                                                                                  |
| CT-PNL-11 | E-mail já cadastrado               | I    | A API responde 400 e o erro aparece no próprio campo de e-mail.                                                                                                                    |
| CT-PNL-12 | Cadastrar aluno                    | I+S  | Envia nome, e-mail normalizado e a turma do painel; mostra "Aluno criado".                                                                                                         |
| CT-PNL-13 | Acesso a `/dashboard`              | I    | Tela de aluno: o professor volta para `/painel`.                                                                                                                                   |
| CT-PNL-14 | Acesso a `/turmas`                 | I    | Tela de admin: o professor volta para `/painel`.                                                                                                                                   |
| CT-PNL-15 | Acesso a `/atitudes`               | I    | Tela de admin: o professor volta para `/painel`.                                                                                                                                   |

### 7.9 Professor — Missões — `cypress/e2e/teacher/missions.cy.ts`

| ID        | Caso                             | Modo | Resultado esperado                                                                                   |
| --------- | -------------------------------- | ---- | ---------------------------------------------------------------------------------------------------- |
| CT-TMS-01 | Listar, paginar e filtrar        | I    | Seis missões por página; "Próxima" e o filtro "Quiz" mudam a URL e a lista bate com a API.           |
| CT-TMS-02 | Validação do quiz                | I    | Sem título, perguntas e alternativas, os erros aparecem e nada é enviado.                            |
| CT-TMS-03 | Validação de vocabulário e áudio | I    | Vocabulário exige conteúdo; áudio exige link completo com `https://`.                                |
| CT-TMS-04 | Criar quiz                       | I+S  | Envia tipo, título, descrição, XP, turma e as cinco perguntas com a alternativa correta de cada uma. |
| CT-TMS-05 | Editar missão                    | I+S  | O formulário vem preenchido, o tipo fica bloqueado e o título novo é enviado.                        |
| CT-TMS-06 | Desativar missão                 | I+S  | Pede confirmação; "Cancelar" não envia nada; "Desativar" envia `{ active: false }`.                  |
| CT-TMS-07 | Reativar missão                  | S    | Uma missão inativa mostra o selo "Inativa" e "Reativar" envia `{ active: true }`.                    |

O CT-TMS-07 altera a resposta da listagem no caminho (`cy.intercept` com
`req.continue`), porque o seed não tem missão desativada.

### 7.10 Professor — Perfil — `cypress/e2e/teacher/profile.cy.ts`

| ID        | Caso              | Modo | Resultado esperado                                                                                       |
| --------- | ----------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| CT-TPR-01 | Crachá            | I    | Papel, nome, e-mail e as turmas do professor.                                                            |
| CT-TPR-02 | Suas turmas       | I    | Cada turma com a contagem de alunos e missões da API e atalhos para o painel e as missões daquela turma. |
| CT-TPR-03 | Atividade recente | I    | Total de atitudes aplicadas e a mais recente, com aluno e atitude, iguais aos da API.                    |
| CT-TPR-04 | Foto do crachá    | I    | O avatar do crachá abre o diálogo da foto, com os formatos aceitos e o botão de salvar desativado.       |

### 7.11 Professor — Ranking — `cypress/e2e/teacher/ranking.cy.ts`

| ID        | Caso             | Modo | Resultado esperado                                                                                                         |
| --------- | ---------------- | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| CT-TRK-01 | Ranking da turma | I    | Abre na turma do professor, com o seletor de turma e as posições na mesma ordem da API; nenhuma linha marcada como "Você". |
| CT-TRK-02 | Ranking geral    | I    | "Geral" muda a URL, esconde o seletor de turma e mostra o ranking geral da API; "Turma" traz o seletor de volta.           |

### 7.12 Admin — Turmas — `cypress/e2e/admin/classes.cy.ts`

| ID        | Caso                    | Modo | Resultado esperado                                                                                       |
| --------- | ----------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| CT-TUR-01 | Turmas ativas           | I    | As mesmas turmas da API, cada uma com o professor e a contagem de alunos e missões.                      |
| CT-TUR-02 | Busca                   | I    | A busca pelo nome do professor mostra só a turma dele; sem resultado, mostra "Nenhuma turma encontrada". |
| CT-TUR-03 | Filtro por status       | I    | "Inativas" e "Todas" mudam a URL (`?status=`) e a lista.                                                 |
| CT-TUR-04 | Validação da nova turma | I    | Sem nome e sem professor, os erros aparecem e nada é enviado.                                            |
| CT-TUR-05 | Nome repetido           | I    | A API recusa e o erro "Já existe uma turma com este nome." aparece no próprio campo.                     |
| CT-TUR-06 | Criar turma             | I+S  | Envia `{ name, teacher }` com o professor escolhido e fecha o diálogo.                                   |
| CT-TUR-07 | Editar turma            | I+S  | O formulário vem preenchido; envia o nome novo, o novo professor e `active: true`.                       |
| CT-TUR-08 | Desativar turma         | I+S  | Pede confirmação mostrando a turma e o professor; envia `{ active: false }`.                             |
| CT-TUR-09 | Reativar turma          | S    | Uma turma inativa mostra o selo "Inativa" e "Reativar" envia `{ active: true }`.                         |

### 7.13 Admin — Alunos — `cypress/e2e/admin/students.cy.ts`

| ID        | Caso                  | Modo | Resultado esperado                                                                                         |
| --------- | --------------------- | ---- | ---------------------------------------------------------------------------------------------------------- |
| CT-ALU-01 | Alunos ativos         | I    | Total, alunos da primeira página, turma ("Sem turma" quando não tem), nível e paginação iguais aos da API. |
| CT-ALU-02 | Busca pelo nome       | I    | A busca vai para a URL (`?busca=`) e a lista e a contagem batem com a busca na API.                        |
| CT-ALU-03 | Filtro por turma      | I    | A URL ganha `?turma=` e a lista mostra só os alunos ativos daquela turma.                                  |
| CT-ALU-04 | Inativos e reativação | I+S  | "Inativos" mostra o selo "Inativo"; "Reativar" envia `{ active: true }`.                                   |
| CT-ALU-05 | Perfil do aluno       | I    | Abre com nome, nível e histórico de XP.                                                                    |
| CT-ALU-06 | Tirar da turma        | I+S  | A edição vem preenchida; "Sem turma" envia `class: null`.                                                  |
| CT-ALU-07 | Desativar aluno       | I+S  | Pede confirmação avisando que o aluno não vai mais conseguir entrar; envia `{ active: false }`.            |
| CT-ALU-08 | Cadastrar sem turma   | I+S  | Sem turma, o campo `class` nem vai no corpo; mostra "Aluno criado".                                        |

### 7.14 Admin — Professores — `cypress/e2e/admin/teachers.cy.ts`

| ID        | Caso                        | Modo | Resultado esperado                                                                                                                 |
| --------- | --------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| CT-PRO-01 | Professores e turmas        | I    | Cada professor da API com o e-mail e as turmas dele.                                                                               |
| CT-PRO-02 | Busca pelo e-mail           | I    | Mostra só o professor buscado.                                                                                                     |
| CT-PRO-03 | Desativados                 | I    | A URL ganha `?status=desativados` e aparece "Nenhum professor desativado."                                                         |
| CT-PRO-04 | Validação do novo professor | I    | Nome com 1 letra e e-mail inválido são barrados sem chamar a API.                                                                  |
| CT-PRO-05 | Cadastrar já com turma      | I+S  | O formulário avisa quem a turma deixa ("sai de …"); envia nome, e-mail e a turma; mostra "Professor cadastrado".                   |
| CT-PRO-06 | Renomear e trocar turmas    | I+S  | Envia o nome novo; a turma marcada recebe o professor e a desmarcada fica sem (`teacher: null`).                                   |
| CT-PRO-07 | Edição com turmas lentas    | I    | Com a resposta das turmas atrasada 1,5 s, a edição só mostra o formulário depois que elas chegam, com as do professor já marcadas. |
| CT-PRO-08 | Desativar professor         | I+S  | A confirmação lista as turmas que ficam sem professor ativo; envia `{ active: false }`.                                            |

### 7.15 Admin — Atitudes — `cypress/e2e/admin/attitudes.cy.ts`

| ID        | Caso                      | Modo | Resultado esperado                                                                                       |
| --------- | ------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| CT-ATI-01 | Atitudes ativas           | I    | As mesmas atitudes da API, com o XP com sinal (punição negativa).                                        |
| CT-ATI-02 | Desativadas e reativação  | I+S  | Mostra o selo "Desativada", sem botão de editar; "Reativar" envia `{ active: true }`.                    |
| CT-ATI-03 | Validação da nova atitude | I    | Nome com 1 letra e XP zero são barrados sem chamar a API.                                                |
| CT-ATI-04 | Criar punição             | I+S  | A prévia mostra o card com "-8 XP"; o corpo leva o XP sem sinal (`xp_value: 8`) e `type: "negative"`.    |
| CT-ATI-05 | Editar punição            | I+S  | O campo mostra o XP com sinal; trocar para positivo transforma a punição em prêmio (`type: "positive"`). |
| CT-ATI-06 | Desativar atitude         | I+S  | Pede confirmação com o nome da atitude; envia `{ active: false }`.                                       |

O CT-TUR-09 simula a lista de turmas inativas, porque o seed não tem turma
desativada.

### 7.16 Tema claro e escuro — `cypress/e2e/theme/theme.cy.ts`

| ID        | Caso                           | Modo | Resultado esperado                                                                                            |
| --------- | ------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------- |
| CT-TEM-01 | Aparelho no escuro             | I    | Na primeira visita, o `<html>` tem a classe `dark` e `color-scheme: dark`.                                    |
| CT-TEM-02 | Aparelho no claro              | I    | Na primeira visita, o `<html>` fica sem `dark` e com `color-scheme: light`.                                   |
| CT-TEM-03 | Botão no login                 | I    | O botão alterna claro e escuro e guarda a escolha (`levelup-english:theme`) no navegador.                     |
| CT-TEM-04 | Escolha salva vence o aparelho | I    | Com o aparelho no escuro e "claro" salvo, a tela abre no claro.                                               |
| CT-TEM-05 | Dentro do app                  | I    | A escolha salva vale no dashboard; o botão do cabeçalho troca o tema e a troca continua depois de recarregar. |

## 8. Critérios

| Critério                 | Definição                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Entrada**              | Backend e frontend rodando localmente; banco com o `seed:demo`; `npm run typecheck` e `npm run lint` sem erros.                            |
| **Aprovação de um caso** | Todas as verificações do caso passam dentro do tempo limite (10 s por comando).                                                            |
| **Saída**                | 100% dos casos aprovados. Um caso que falha bloqueia o merge da branch até ser corrigido o sistema ou, se a regra mudou, o próprio teste.  |
| **Suspensão**            | Backend fora do ar, ou banco sem os dados de demonstração: a execução é interrompida, porque as falhas não indicariam defeito no frontend. |

## 9. Resultados da execução

Execução de 22/10/2026, ambiente da seção 4:

| Suíte                | Arquivo                        |   Casos | Aprovados | Falhas |
| -------------------- | ------------------------------ | ------: | --------: | -----: |
| Login                | `auth/login.cy.ts`             |       6 |         6 |      0 |
| Recuperação de senha | `auth/password-recovery.cy.ts` |       8 |         8 |      0 |
| Sessão               | `auth/session.cy.ts`           |       6 |         6 |      0 |
| Dashboard            | `student/dashboard.cy.ts`      |       6 |         6 |      0 |
| Missões              | `student/mission.cy.ts`        |      11 |        11 |      0 |
| Perfil               | `student/profile.cy.ts`        |       6 |         6 |      0 |
| Ranking              | `student/ranking.cy.ts`        |       2 |         2 |      0 |
| Painel do professor  | `teacher/panel.cy.ts`          |      15 |        15 |      0 |
| Missões do professor | `teacher/missions.cy.ts`       |       7 |         7 |      0 |
| Perfil do professor  | `teacher/profile.cy.ts`        |       3 |         3 |      0 |
| Ranking do professor | `teacher/ranking.cy.ts`        |       2 |         2 |      0 |
| Turmas do admin      | `admin/classes.cy.ts`          |       9 |         9 |      0 |
| Alunos do admin      | `admin/students.cy.ts`         |       8 |         8 |      0 |
| Professores do admin | `admin/teachers.cy.ts`         |       8 |         8 |      0 |
| Atitudes do admin    | `admin/attitudes.cy.ts`        |       6 |         6 |      0 |
| Tema claro e escuro  | `theme/theme.cy.ts`            |       5 |         5 |      0 |
| **Total**            |                                | **108** |   **108** |  **0** |

Tempo total: cerca de 3 minutos e 10 segundos.

## 10. Defeitos encontrados

| ID     | Defeito                                                                                                                                                                                                                                                                   | Como foi encontrado                                                                          | Situação                                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| DEF-01 | **A sessão não era renovada quando o token vencia.** O backend responde **498** para token inválido ou expirado, mas o frontend só tentava renovar no **401**. Na prática, depois de 1 dia (validade do token), o aluno via as telas com erro e não era mandado ao login. | CT-SES-04 e CT-SES-05 falharam na primeira execução: nenhuma chamada de renovação acontecia. | Corrigido em `src/lib/api.ts` (`isSessionRejected` aceita 401 e 498) e documentado em `docs/api.md`. Os dois casos passam desde então. |

| DEF-02 | **A edição de professor podia tirar o professor de todas as turmas.** O formulário marcava as turmas do professor só no momento em que o diálogo abria. Se o admin clicasse em "Editar" antes de as turmas carregarem (comum com a API hospedada "fria"), o formulário abria sem nenhuma turma marcada, e salvar removia o professor de todas elas. | CT-PRO-07 falhou na primeira execução: com as turmas atrasadas, as caixas continuavam desmarcadas. | Corrigido em `src/components/admin/teachers/edit-teacher-dialog.tsx`: enquanto as turmas carregam, o diálogo mostra "Carregando as turmas…" e o formulário só aparece com elas já marcadas. O caso passa desde então. |

O CT-PRF-05 cobre um defeito corrigido antes da criação dos testes (errar a
senha atual em "Alterar senha" encerrava a sessão) e garante que ele não volte.

## 11. Riscos, limitações e próximos passos

**Riscos e limitações**

- Os testes integrados dependem dos dados do `seed:demo`. Se os dados mudarem
  (por exemplo, o Arthur resolver missões), alguns casos falham sem que haja
  defeito; a solução é rodar o seed de novo.
- Os testes do admin contam com dados do seed: cada turma com um professor
  diferente (CT-TUR-02), pelo menos um aluno e uma atitude desativados
  (CT-ALU-04 e CT-ATI-02).
- Os testes rodam só em tela de computador (1280 × 800) e num único navegador.
- O contraste dos dois temas (WCAG AA) não é verificado pelo Cypress; ele foi
  conferido com o detector do Impeccable nas telas principais, no celular e no
  desktop.
- O frontend roda em modo de desenvolvimento; a primeira abertura de cada tela é
  mais lenta, por isso o tempo limite por comando é de 10 s.

**Próximos passos**

| Versão | Escopo planejado                                 | Pasta |
| ------ | ------------------------------------------------ | ----- |
| 1.5    | Fluxos principais em tela de celular (390 × 844) | todas |

## 12. Histórico de versões

| Versão | Data       | Mudança                                                                    |
| ------ | ---------- | -------------------------------------------------------------------------- |
| 1.0    | 19/10/2026 | Autenticação e telas do aluno (45 casos).                                  |
| 1.1    | 21/10/2026 | Telas do professor: painel, missões, perfil e ranking (27 casos).          |
| 1.2    | 22/10/2026 | Telas do admin: turmas, alunos, professores e atitudes (31 casos); DEF-02. |
| 1.3    | 22/10/2026 | Tema claro e escuro (5 casos).                                             |
| 1.4    | 27/10/2026 | Foto de perfil do aluno e do professor (5 casos).                          |
