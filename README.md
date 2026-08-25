# LevelUp English — Frontend

Interface web da **LevelUp English**, plataforma de gamificação para aprendizado
de inglês: missões, atitudes, XP, níveis e ranking por turma.

Construído com Next.js 16 (App Router), React 19, TypeScript e Tailwind CSS 4.

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
├── components/   # componentes de UI reutilizáveis
├── contexts/     # React contexts
├── lib/          # utilitários e configuração de infraestrutura
├── providers/    # providers que embrulham a árvore da aplicação
├── schemas/      # schemas de validação de formulários e payloads
├── services/     # chamadas à LevelUp English API
└── types/        # tipos TypeScript compartilhados
docs/             # documentação do projeto
```

O alias `@/*` aponta para `src/*` — por exemplo,
`import { api } from "@/services/api"`.
