# LevelUp English API

Referência rápida da API consumida por este frontend. A fonte da verdade é o
Swagger:

- Swagger UI: https://level-up-english-api.onrender.com/api-docs/
- OpenAPI JSON: https://level-up-english-api.onrender.com/api-docs.json

URL base (Render): `https://level-up-english-api.onrender.com`
URL base (backend local em dev): `http://localhost:5011`

No frontend, sempre via `process.env.NEXT_PUBLIC_API_URL` — troque o valor no
`.env.local` para alternar entre os dois.

## Formato das respostas

Toda resposta vem num envelope:

```json
{ "message": "…", "data": {}, "errors": [{ "path": "email", "message": "…" }] }
```

O `apiFetch` (`src/lib/api.ts`) devolve só o `data`. Em erro, lança `ApiError`
com o `status` e a lista `errors`; os formulários usam o `path` de cada item
para mostrar a mensagem no campo certo.

Listagens são paginadas no formato do mongoose-paginate (`docs`, `totalDocs`,
`limit`, `page`, `totalPages`, `hasPrevPage`, `hasNextPage`, `prevPage`,
`nextPage`) — tipo `Paginated<T>` em `src/lib/types.ts`. O Swagger de algumas
listagens declara um array simples; confira a resposta real.

## Autenticação

JWT no header `Authorization: Bearer <accessToken>`.

| Etapa           | Como funciona                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login           | `POST /auth/login` com `{ email, password }` devolve `{ accessToken, refreshToken, user }`.                                                           |
| Renovação       | Access token vale 1 dia. Em 401, `POST /auth/refresh` com `{ refreshToken }` devolve um novo par. O refresh vale 7 dias e é trocado a cada renovação. |
| Logout          | `POST /auth/logout` com `{ refreshToken }` (sem header). Apaga os tokens no banco; sempre responde 200.                                               |
| Primeiro acesso | Alunos e professores são cadastrados sem senha e recebem um e-mail com link para `/set-password` (vale 24h).                                          |
| Esqueci a senha | `POST /auth/forgot-password` envia um link para `/reset-password`; a nova senha vai em `POST /auth/reset-password` com `{ code, newPassword }`.       |

O backend só aceita tokens de quem tem refresh token salvo: depois do logout (ou
de `POST /auth/revoke/{userId}`, feito pelo admin), nenhum token antigo vale.

## Papéis e permissões

`student`, `teacher` e `admin`. Cada rota declara quais papéis podem chamá-la;
papel fora da lista recebe **403**, assim como qualquer usuário com
`active: false`.

A posse do recurso é verificada depois, no service. Admin não tem essas
restrições. Professor:

- só edita as turmas dele (turma criada por professor já nasce dele);
- só cria missão em turma dele e só altera ou exclui missão que ele criou;
- só aplica atitude e ajusta XP de aluno das turmas dele, e só altera ou exclui
  os registros de atitude que ele mesmo aplicou;
- só cadastra aluno nas turmas dele (a turma é obrigatória) e só exclui aluno
  das turmas dele;
- só lista alunos filtrando por turma dele.

Aluno só vê as missões e o ranking da própria turma, só vê o próprio perfil e
só exclui a própria conta. As respostas de missão para aluno vêm sem a resposta
correta das perguntas.

## Rotas

Coluna **Papéis**: A = admin, P = professor, Al = aluno; "pública" não exige
token.

### Auth

| Método | Rota                     | Papéis          |
| ------ | ------------------------ | --------------- |
| POST   | `/auth/login`            | pública         |
| POST   | `/auth/refresh`          | pública         |
| POST   | `/auth/logout`           | pública         |
| POST   | `/auth/forgot-password`  | pública         |
| POST   | `/auth/reset-password`   | pública         |
| PATCH  | `/auth/change-password`  | qualquer logado |
| POST   | `/auth/register-student` | A, P            |
| POST   | `/auth/register-teacher` | A               |
| POST   | `/auth/revoke/{userId}`  | A               |

### Usuários

| Método | Rota                        | Papéis   |
| ------ | --------------------------- | -------- |
| GET    | `/users`                    | A, P     |
| POST   | `/users`                    | A, P     |
| GET    | `/users/{id}`               | A, P, Al |
| PATCH  | `/users/{id}`               | A, P, Al |
| DELETE | `/users/{id}`               | A, P, Al |
| POST   | `/users/recalculate-levels` | A        |

Só o admin edita outros usuários. Professor e aluno editam só a própria conta,
e sem mudar papel, XP, nível, turma, status, e-mail ou senha (a senha tem rota
própria). Filtros do `GET /users`: `role`, `active`, `class` (`none` = sem turma,
só admin).

### Turmas

| Método | Rota            | Papéis   |
| ------ | --------------- | -------- |
| GET    | `/classes`      | A, P, Al |
| GET    | `/classes/{id}` | A, P, Al |
| POST   | `/classes`      | A, P     |
| PATCH  | `/classes/{id}` | A, P     |
| DELETE | `/classes/{id}` | A        |

Filtros do `GET /classes`: `active`, `teacher`. `teacher: null` no `PATCH`
deixa a turma sem professor.

### Missões

| Método | Rota                      | Papéis   |
| ------ | ------------------------- | -------- |
| GET    | `/missions`               | A, P, Al |
| GET    | `/missions/{id}`          | A, P, Al |
| POST   | `/missions`               | A, P     |
| PATCH  | `/missions/{id}`          | A, P     |
| DELETE | `/missions/{id}`          | A, P     |
| POST   | `/missions/{id}/progress` | Al       |

No `progress`, o quiz manda `answers` e o servidor corrige; vocabulário e áudio
mandam `score`. O XP é `xp_reward × melhor nota / 100`, descontado o que já foi
creditado — refazer a missão só paga a diferença. O progresso guarda a melhor
nota (`best_score` na resposta).

### Atitudes

| Método | Rota                  | Papéis   |
| ------ | --------------------- | -------- |
| GET    | `/attitudes`          | A, P, Al |
| GET    | `/attitudes/{id}`     | A, P, Al |
| POST   | `/attitudes`          | A, P     |
| PATCH  | `/attitudes/{id}`     | A, P     |
| DELETE | `/attitudes/{id}`     | A        |
| GET    | `/attitude-logs`      | A, P     |
| GET    | `/attitude-logs/{id}` | A, P     |
| POST   | `/attitude-logs`      | A, P     |
| PATCH  | `/attitude-logs/{id}` | A, P     |
| DELETE | `/attitude-logs/{id}` | A, P     |

A atitude guarda `xp_value` sem sinal e o `type` (`positive`/`negative`); o
backend aplica o sinal. Atitude desativada não pode ser aplicada. O XP do aluno
nunca fica abaixo de 0.

### Ajuste de XP

| Método | Rota              | Papéis |
| ------ | ----------------- | ------ |
| POST   | `/xp-adjustments` | A, P   |

Corpo `{ student, amount, reason? }`. Como o XP não fica negativo, o
`xp_applied` da resposta pode ser menor que o `amount` pedido.

### Ranking

| Método | Rota                        | Papéis   |
| ------ | --------------------------- | -------- |
| GET    | `/rankings/global`          | A, P, Al |
| GET    | `/rankings/me`              | A, P, Al |
| GET    | `/rankings/class/{classId}` | A, P, Al |
| POST   | `/rankings/refresh`         | A        |

O ranking de uma turma só existe depois que alguém dela ganha XP; antes disso a
rota responde 404, e o frontend mostra o ranking vazio. `/rankings/me` usa a
turma do usuário logado (só faz sentido para aluno).

## Observações do schema

- `User.class` **não** vem populado: é o id cru da turma. Para os dados da
  turma, chamar `GET /classes/{id}`.
- Não existe moeda: a gamificação é só XP, nível (`level`) e o progresso até o
  próximo nível (virtual `progress`, com o campo `percentage`).
- `User.streak` está previsto no RF-009 mas nenhuma regra o alimenta hoje —
  é sempre `0`.
