# LevelUp English — Frontend

Interface web da **LevelUp English**, plataforma de gamificação para aprendizado
de inglês: missões, atitudes, XP, níveis e ranking por turma.

Construído com Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4,
shadcn/ui (base Radix UI, preset `nova`, tema `zinc`), TanStack Query e nuqs.

## Backend

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| API (produção)            | https://level-up-english-api.onrender.com               |
| Documentação (Swagger UI) | https://level-up-english-api.onrender.com/api-docs/     |
| OpenAPI (JSON)            | https://level-up-english-api.onrender.com/api-docs.json |

Um resumo das rotas e do fluxo de autenticação está em [`docs/api.md`](docs/api.md).

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

| Variável              | Descrição                        |
| --------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL base da LevelUp English API. |

Copie `.env.example` para `.env.local` e ajuste conforme o ambiente. O
`.env.local` não é versionado.

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
├── app/          # rotas do App Router, layouts e páginas
├── components/
│   └── ui/       # componentes do shadcn/ui (não editar à mão sem necessidade)
├── contexts/     # React contexts
├── lib/          # utilitários (cn) e configuração de infraestrutura
├── providers/    # providers que embrulham a árvore (AppProviders)
├── schemas/      # schemas de validação de formulários e payloads
├── services/     # chamadas à LevelUp English API
└── types/        # tipos TypeScript compartilhados
docs/             # documentação do projeto
```

O alias `@/*` aponta para `src/*` — por exemplo,
`import { api } from "@/services/api"`.

## shadcn/ui

Configuração em `components.json`: base **Radix UI**, preset **nova**
(ícones Lucide + fonte Geist), cor base **zinc**, com CSS variables. Os tokens
de tema ficam em `src/app/globals.css`.

Para adicionar um componente:

```bash
npx shadcn@latest add button dialog input
```

Os arquivos caem em `src/components/ui/`.

> **Dark mode:** o shadcn usa a estratégia de classe (`.dark` no `<html>`), não
> `prefers-color-scheme`. Os tokens dark já estão definidos, mas nada aplica a
> classe ainda — para ligar o tema escuro será preciso um theme provider
> (ex.: `next-themes`).

## Providers

`src/providers/app-providers.tsx` compõe todos os providers da aplicação e é o
único que o `layout.tsx` importa. Ao adicionar um provider novo (theme, auth),
encaixe ele ali em vez de mexer no layout.

Hoje: `NuqsAdapter` > `QueryProvider`.

## TanStack Query

O `QueryProvider` (`src/providers/query-provider.tsx`) já embrulha a aplicação
no layout raiz. Ele cria um `QueryClient` novo a cada request no servidor — um
client compartilhado vazaria cache de um usuário para outro — e mantém um único
client no navegador.

Defaults configurados: `staleTime` de 60s (evita refetch imediato na
hidratação) e `refetchOnWindowFocus` desligado.

## nuqs

O `NuqsAdapter` já está no `AppProviders` — é obrigatório, sem ele os hooks do
nuqs quebram em runtime.

**Atenção ao Suspense.** Os hooks do nuqs leem os search params, e no App Router
qualquer componente que faça isso precisa estar dentro de um `<Suspense>`, senão
o build falha com `useSearchParams() should be wrapped in a suspense boundary`.
O boundary vai na página, em volta do componente que usa o hook:

```tsx
import { Suspense } from "react";

export default function RankingPage() {
  return (
    <Suspense fallback={<RankingSkeleton />}>
      <RankingFiltrado />
    </Suspense>
  );
}
```

Não coloque esse `<Suspense>` no layout raiz: isso resolveria o erro para todas
as páginas de uma vez, mas ao custo de tirar do prerender estático também as
páginas que não usam nuqs.
