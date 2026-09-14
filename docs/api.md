# LevelUp English API

Referência rápida da API consumida por este frontend. A fonte da verdade é o
Swagger:

- Swagger UI: https://level-up-english-api.onrender.com/api-docs/
- OpenAPI JSON: https://level-up-english-api.onrender.com/api-docs.json

URL base (Render): `https://level-up-english-api.onrender.com`
URL base (backend local em dev): `http://localhost:5011`

No frontend, sempre via `process.env.NEXT_PUBLIC_API_URL` — troque o
valor no `.env.local` para alternar entre os dois.

## Autenticação

JWT no header `Authorization: Bearer <accessToken>`.

`POST /auth/login` recebe `{ email, password }` e devolve
`{ accessToken, refreshToken, user }`. Quando o access token expira,
`POST /auth/refresh` com `{ refreshToken }` devolve um novo par de tokens.

## Papéis

`student`, `teacher` e `admin`. Cada rota autenticada declara no Swagger quais
papéis podem chamá-la — papel fora da lista recebe **403**, assim como qualquer
usuário com `active: false`.

A posse do recurso é verificada depois, no service:

- professor só altera a turma e as missões dele, só aplica atitude a aluno das
  turmas dele e só deleta conta de aluno;
- aluno só enxerga missão e ranking da própria turma.

## Rotas

### Auth

| Método | Rota                     |
| ------ | ------------------------ |
| POST   | `/auth/login`            |
| POST   | `/auth/register-student` |
| POST   | `/auth/refresh`          |
| POST   | `/auth/forgot-password`  |
| POST   | `/auth/reset-password`   |
| PATCH  | `/auth/change-password`  |
| POST   | `/auth/logout`           |
| POST   | `/auth/revoke/{userId}`  |

### Usuários

| Método             | Rota                        |
| ------------------ | --------------------------- |
| GET, POST          | `/users`                    |
| GET, PATCH, DELETE | `/users/{id}`               |
| POST               | `/users/recalculate-levels` |

### Turmas

| Método             | Rota            |
| ------------------ | --------------- |
| GET, POST          | `/classes`      |
| GET, PATCH, DELETE | `/classes/{id}` |

### Missões

| Método             | Rota                      |
| ------------------ | ------------------------- |
| GET, POST          | `/missions`               |
| GET, PATCH, DELETE | `/missions/{id}`          |
| POST               | `/missions/{id}/progress` |

### Atitudes

| Método             | Rota                  |
| ------------------ | --------------------- |
| GET, POST          | `/attitudes`          |
| GET, PATCH, DELETE | `/attitudes/{id}`     |
| GET, POST          | `/attitude-logs`      |
| GET, PATCH, DELETE | `/attitude-logs/{id}` |

### Ranking

| Método | Rota                        |
| ------ | --------------------------- |
| GET    | `/rankings/global`          |
| GET    | `/rankings/me`              |
| GET    | `/rankings/class/{classId}` |
| POST   | `/rankings/refresh`         |

## Observações do schema

- `User.class` **não** vem populado: é o id cru da turma. Para os dados da
  turma, chamar `GET /classes/{id}`.
- `User.streak` está previsto no RF-009 mas nenhuma regra o alimenta hoje —
  é sempre `0`.
