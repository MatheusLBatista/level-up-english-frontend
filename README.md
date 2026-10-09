# LevelUp English — Frontend

Interface web da **LevelUp English**, plataforma de gamificação para o
aprendizado de inglês. Alunos ganham XP concluindo missões e recebendo atitudes
dos professores, sobem de nível e disputam o ranking da turma e o geral.

Construído com Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4,
shadcn/ui (Radix UI), TanStack Query, React Hook Form + Zod e nuqs.

## Funcionalidades por papel

A navegação muda conforme o papel de quem entra. Cada página checa o papel
(`RoleGuard`) e o backend confere de novo em toda requisição.

### Aluno

| Tela      | Rota         | O que faz                                                                          |
| --------- | ------------ | ---------------------------------------------------------------------------------- |
| Dashboard | `/dashboard` | Nível, XP, progresso até o próximo nível e missões recomendadas.                   |
| Missões   | `/missoes`   | Missões da turma (quiz, vocabulário, áudio) com filtro por tipo; resolve no modal. |
| Ranking   | `/ranking`   | Ranking geral e da própria turma.                                                  |
| Perfil    | `/perfil`    | Dados, turma, conquistas; edição do nome e troca de senha.                         |

### Professor

| Tela    | Rota       | O que faz                                                                                      |
| ------- | ---------- | ---------------------------------------------------------------------------------------------- |
| Painel  | `/painel`  | Grade de alunos da turma: aplicar atitudes, ajustar XP e cadastrar alunos nas próprias turmas. |
| Missões | `/missoes` | Criar, editar, desativar e reativar missões das suas turmas (inclui editor de quiz).           |
| Ranking | `/ranking` | Ranking geral e de cada uma das suas turmas.                                                   |
| Perfil  | `/perfil`  | Crachá, suas turmas com atalhos e as últimas atitudes aplicadas.                               |

### Admin

| Tela        | Rota           | O que faz                                                              |
| ----------- | -------------- | ---------------------------------------------------------------------- |
| Painel      | `/painel`      | O mesmo painel do professor, com acesso a todas as turmas.             |
| Turmas      | `/turmas`      | Criar, editar, desativar e reativar turmas e escolher o professor.     |
| Alunos      | `/alunos`      | Cadastrar (com e-mail de convite), editar, mudar de turma e desativar. |
| Professores | `/professores` | Cadastrar, definir as turmas de cada professor e desativar.            |
| Atitudes    | `/atitudes`    | Catálogo de atitudes (prêmios e punições em XP) usadas no painel.      |
| Missões     | `/missoes`     | Gerencia as missões de qualquer turma.                                 |
| Ranking     | `/ranking`     | Ranking geral e de qualquer turma.                                     |
| Perfil      | `/perfil`      | Crachá, turmas da escola e as últimas atitudes que aplicou.            |

### Telas públicas

`/login`, `/esqueci-senha`, `/reset-password` (link do e-mail de recuperação) e
`/set-password` (link do e-mail de boas-vindas, para criar a primeira senha). A
raiz `/` redireciona para o login.

## Backend

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| API (produção)            | https://level-up-english-api.onrender.com               |
| Documentação (Swagger UI) | https://level-up-english-api.onrender.com/api-docs/     |
| OpenAPI (JSON)            | https://level-up-english-api.onrender.com/api-docs.json |

Um resumo das rotas, das permissões e do fluxo de autenticação está em
[`docs/api.md`](docs/api.md).

> A API está hospedada no plano gratuito do Render: a primeira requisição depois
> de um período ocioso pode levar ~50s até o serviço acordar.

## Requisitos

- Node.js >= 20.9 (o projeto usa 22.13.0 — veja `.nvmrc`)
- npm

## Como rodar

```bash
nvm use          # opcional, respeita o .nvmrc
npm install
cp .env.example .env.local
npm run dev
```

A aplicação sobe em http://localhost:3000.

## Variáveis de ambiente

| Variável              | Descrição                                                                  |
| --------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL base da API. Produção: Render; backend local: `http://localhost:5011`. |

Copie `.env.example` para `.env.local` e ajuste conforme o ambiente. O
`.env.local` não é versionado. Variáveis `NEXT_PUBLIC_*` são embutidas no build:
depois de trocar o valor, reinicie o `npm run dev`.

## Scripts

| Script                 | O que faz                                          |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento.                       |
| `npm run build`        | Build de produção.                                 |
| `npm run start`        | Sobe o build de produção.                          |
| `npm run lint`         | ESLint.                                            |
| `npm run lint:fix`     | ESLint com correção automática.                    |
| `npm run typecheck`    | Gera os tipos de rota do Next e roda o TypeScript. |
| `npm run format`       | Formata com Prettier.                              |
| `npm run format:check` | Verifica a formatação sem alterar arquivos.        |

## Estrutura

```
src/
├── app/                 # rotas do App Router
│   ├── (app)/           # área logada: layout com AuthGuard, sidebar e header
│   └── login/, ...      # telas públicas
├── components/
│   ├── admin/           # telas do admin (turmas, alunos, professores, atitudes)
│   ├── auth/            # formulários de acesso e guards (Auth, Guest, Role)
│   ├── dashboard/       # dashboard do aluno
│   ├── layout/          # sidebar e header
│   ├── missions/        # listagem, resolução e gestão de missões
│   ├── profile/         # perfis do aluno e do professor/admin
│   ├── ranking/         # ranking
│   ├── shared/          # peças usadas por várias telas (paginação, filtros)
│   ├── teacher/         # painel do professor
│   └── ui/              # componentes do shadcn/ui
├── contexts/            # AuthProvider (sessão do usuário)
├── hooks/               # hooks de dados (TanStack Query) e utilitários
├── lib/                 # cliente da API, tipos, regras puras e utilitários
├── providers/           # AppProviders e QueryProvider
├── schemas/             # schemas Zod dos formulários
└── services/            # funções que chamam a API, uma por endpoint
docs/                    # documentação do projeto
```

O alias `@/*` aponta para `src/*` — por exemplo,
`import { apiFetch } from "@/lib/api"`.

## Arquitetura

### Camadas

Toda tela segue o mesmo caminho até a API:

```
componente → hook (TanStack Query) → service → apiFetch (lib/api.ts) → API
```

- **`services/`** só monta a requisição (método, rota, corpo) e tipa a resposta.
- **`hooks/`** envolvem os services em `useQuery`/`useMutation`, definem as
  chaves de cache e o que invalidar depois de uma escrita.
- **`schemas/`** validam os formulários com Zod (via React Hook Form); erros de
  campo devolvidos pela API são exibidos no campo correspondente.
- **`lib/`** guarda regras puras, sem React (cálculo de XP, paginação, conversão
  entre formulário e corpo da API), fáceis de ler e de testar isoladamente.

### Cliente da API

`src/lib/api.ts` (`apiFetch`) é o único ponto que faz `fetch`:

- desembrulha o envelope `{ message, data, errors }` da API e devolve só `data`;
- transforma respostas de erro em `ApiError` (com `status` e erros por campo);
- quando recebe **401**, renova os tokens com `POST /auth/refresh` e repete a
  requisição. Várias requisições que falham ao mesmo tempo esperam uma única
  renovação. Se a renovação falhar, a sessão é encerrada.

### Autenticação

- O login devolve `accessToken`, `refreshToken` e o usuário no corpo da
  resposta. A sessão fica no `localStorage` e é exposta pelo `AuthProvider`
  (`useAuth`).
- `AuthGuard` protege a área logada; `GuestGuard` tira quem já está logado das
  telas públicas; `RoleGuard` limita cada página aos papéis permitidos e manda o
  usuário para a home do seu papel (`lib/routes.ts`).
- "Sair" limpa a sessão local e chama `POST /auth/logout` com o refresh token,
  que apaga os tokens no servidor.

### Estado na URL

Filtros, abas, página atual e turma selecionada ficam na query string com
**nuqs** (`?status=`, `?pagina=`, `?busca=`, `?turma=`, `?escopo=`). Assim um F5
ou um link compartilhado abre a tela exatamente como estava, e a turma escolhida
no Painel é a mesma em Missões e Ranking.

### Cache

O `QueryProvider` cria um `QueryClient` por request no servidor (um client
compartilhado vazaria cache entre usuários) e um único client no navegador.
Defaults: `staleTime` de 60s e `refetchOnWindowFocus` desligado. Depois de cada
escrita, os hooks de mutation invalidam as chaves afetadas (ex.: aplicar uma
atitude atualiza a grade do painel e os rankings).

O nuqs lê os search params, o que no App Router normalmente exige um
`<Suspense>` em volta. Aqui não é preciso: toda tela que usa nuqs fica dentro do
`AuthGuard`, que só renderiza o conteúdo no navegador, depois de ler a sessão.
Uma tela nova que use nuqs **fora** da área logada precisa do `<Suspense>`.

## Decisões de projeto

- **Desativar em vez de excluir.** Turmas, alunos, professores, missões e
  atitudes são desativados (`active: false`) e podem ser reativados. Assim o
  histórico (XP ganho, atitudes aplicadas, progresso) continua íntegro.
- **Sem moedas.** O protótipo previa moedas, mas a API trabalha só com XP e
  nível; os cards de moedas viraram nível e barra de progresso.
- **Cor da atitude vem do tipo.** Verde para atitudes positivas e vermelho para
  negativas; no formulário o XP tem sinal (negativo = punição).
- **Tokens no `localStorage`.** A API devolve os tokens no corpo, não em cookie.
  Guardá-los em cookie `httpOnly` exigiria mudar o backend; fica como evolução
  de segurança.
- **Permissões nas duas pontas.** O front esconde o que o papel não pode fazer,
  e o backend recusa de qualquer forma (ex.: professor só cadastra alunos nas
  próprias turmas).

## shadcn/ui

Configuração em `components.json`: base **Radix UI**, preset **nova** (ícones
Lucide + fonte Geist), cor base **zinc**, com CSS variables. Os tokens de tema e
os gradientes da marca ficam em `src/app/globals.css`. O app usa sempre o tema
escuro (classe `dark` fixa no `<html>`).

Para adicionar um componente:

```bash
npx shadcn@latest add button dialog input
```

Os arquivos caem em `src/components/ui/`.

O preset gera componentes que importam `cn` do pacote `cn` (oficial do shadcn,
equivalente a `clsx` + `tailwind-merge`); os componentes mais antigos importam
de `@/lib/utils`. As duas formas fazem a mesma coisa.

## Providers

`src/providers/app-providers.tsx` compõe todos os providers e é o único que o
`layout.tsx` importa:

`NuqsAdapter` > `QueryProvider` > `AuthProvider` > `TooltipProvider`

Ao adicionar um provider novo, encaixe-o ali em vez de mexer no layout.
