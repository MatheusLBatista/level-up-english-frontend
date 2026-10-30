# LevelUp English API

Referência rápida da API consumida por este frontend. A fonte da verdade é o
Swagger:

- Swagger UI: http://localhost:5011/api-docs/
- OpenAPI JSON: http://localhost:5011/api-docs.json

URL base (backend local em dev): `http://localhost:5011`

No frontend, sempre via `process.env.NEXT_PUBLIC_API_URL`, definida no
`.env.local`.

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

| Etapa           | Como funciona                                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login           | `POST /auth/login` com `{ email, password }` devolve `{ accessToken, refreshToken, user }`.                                                                                                                                |
| Renovação       | Access token vale 1 dia. Token inválido ou expirado responde 498 (e 401 sem refresh salvo); nos dois, `POST /auth/refresh` com `{ refreshToken }` devolve um novo par. O refresh vale 7 dias e é trocado a cada renovação. |
| Logout          | `POST /auth/logout` com `{ refreshToken }` (sem header). Apaga os tokens no banco; sempre responde 200.                                                                                                                    |
| Primeiro acesso | Alunos e professores são cadastrados sem senha e recebem um e-mail com link para `/set-password` (vale 24h).                                                                                                               |
| Esqueci a senha | `POST /auth/forgot-password` envia um link para `/reset-password`; a nova senha vai em `POST /auth/reset-password` com `{ code, newPassword }`.                                                                            |

O backend só aceita tokens de quem tem refresh token salvo: depois do logout (ou
de `POST /auth/revoke/{userId}`, feito pelo admin), nenhum token antigo vale.

Login, esqueci a senha e nova senha têm limite de tentativas e respondem **429**
(com `Retry-After`) ao estourar. Login: 10 falhas em 15 minutos por IP + e-mail
(um aluno errando não bloqueia o laboratório inteiro) e 100 por IP.
`forgot-password`: 5 pedidos por hora por IP + e-mail. `reset-password`, que
também é o primeiro acesso: 10 falhas em 15 minutos por IP. `refresh` e
`logout` não têm limite. A mensagem do 429 vem no envelope padrão, e os
formulários a mostram como qualquer outro erro.

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
| GET    | `/users/{id}/xp-history`    | A, P, Al |
| POST   | `/users/recalculate-levels` | A        |

Só o admin edita outros usuários. Professor e aluno editam só a própria conta,
e sem mudar papel, XP, nível, turma, status, e-mail ou senha (a senha tem rota
própria). Filtros do `GET /users`: `role`, `active`, `class` (`none` = sem turma,
só admin).

O `xp-history` junta numa linha do tempo, da mais recente para a mais antiga,
tudo o que mexeu no XP do aluno: atitudes aplicadas (`kind: "attitude"`),
ajustes manuais (`"adjustment"`) e missões que renderam XP (`"mission"`). Cada
item traz `id`, `kind`, `xp` (com sinal: o que entrou de fato, já com o piso em
0), `title`, `detail` e `date`. O `detail` muda conforme a origem: na atitude é
quem aplicou; no ajuste, o motivo (quem ajustou vem em `teacher`); na missão,
"Melhor nota: X%". Paginado com `page` e `limit` (padrão 10, máximo 50). O
aluno só vê o próprio histórico, o professor só o de alunos das turmas dele e o
admin o de qualquer aluno; um id que não seja de aluno responde 404.

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

O título é único por turma, sem diferenciar maiúsculas: turmas diferentes podem
ter missões com o mesmo título. Repetido na mesma turma, a API responde 400 com
`path: "title"`, e o formulário mostra o erro no campo.

O quiz exige no mínimo 5 perguntas; vocabulário e áudio, de 1 a 3 perguntas de
checagem. Missões antigas de vocabulário e áudio, sem perguntas, continuam
valendo até serem editadas.

O formulário limita o enunciado a 500 caracteres e cada alternativa a 200
(`questionTextLimits` em `src/schemas/mission.ts`). Por enquanto o limite existe
só no frontend: o backend ainda não valida esses tamanhos e deve adotar os
mesmos valores.

No `progress`, toda missão com perguntas manda `answers` na ordem das questões
e o servidor corrige — o `score` do corpo é ignorado. O servidor compara
`answers[i]` com o gabarito da pergunta `i` na ordem em que ela veio da API, e
recusa um `answers` de tamanho diferente do número de perguntas. O quiz mostra
as perguntas em ordem aleatória para o aluno, mas guarda cada resposta pela
posição original da pergunta (`src/lib/quiz.ts`); o envio continua na ordem da
API. As alternativas não são embaralhadas. Vocabulário e áudio
antigos, sem perguntas, mandam só `{ done: true }`. O XP é
`xp_reward × melhor nota / 100`, descontado o que já foi creditado — refazer a
missão só paga a diferença. O progresso guarda a melhor nota (`best_score` na
resposta).

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
`xp_applied` da resposta pode ser menor que o `amount` pedido. Não há listagem
própria: os ajustes aparecem no `GET /users/{id}/xp-history`.

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

### Notificações

| Método | Rota                          | Papéis          |
| ------ | ----------------------------- | --------------- |
| GET    | `/notifications/unread-count` | qualquer logado |
| GET    | `/notifications`              | qualquer logado |
| PATCH  | `/notifications/{id}/read`    | qualquer logado |
| PATCH  | `/notifications/read-all`     | qualquer logado |

Cada usuário só vê e altera as próprias notificações. Hoje só alunos recebem
notificações, por isso o frontend mostra o sino apenas para o papel `student`.

- `unread-count` devolve `{ unread }`. É uma rota leve, feita para ser
  consultada periodicamente; o frontend consulta a cada 60 s, com pausa quando a
  aba está oculta.
- `GET /notifications` é paginado com `page` e `limit` (padrão 10, máximo 50),
  da mais recente para a mais antiga.
- `PATCH /{id}/read` devolve a notificação com `read: true`. Id inexistente ou de
  outro usuário responde 404; marcar de novo uma já lida responde 200.
- `PATCH /read-all` devolve `{ updated }`, a quantidade marcada.

Cada notificação traz `_id`, `user`, `type`, `message`, `data`, `read`,
`createdAt` e `updatedAt`. O `message` já vem pronto para exibir; o frontend não
monta texto. O conteúdo de `data` depende do `type`:

| `type`          | `data`                           | Ao clicar, o frontend abre |
| --------------- | -------------------------------- | -------------------------- |
| `attitude`      | `{ xp, attitude_log, attitude }` | `/dashboard#historico`     |
| `xp_adjustment` | `{ xp, xp_adjustment }`          | `/dashboard#historico`     |
| `new_mission`   | `{ mission }` (id da missão)     | `/missoes/{mission}`       |

O `xp` tem sinal: positivo ganhou, negativo perdeu. Numa atitude removida, o
`attitude_log` não vem. Notificações com mais de 90 dias são apagadas pelo
servidor.

## Observações do schema

- `User.class` **não** vem populado: é o id cru da turma. Para os dados da
  turma, chamar `GET /classes/{id}`.
- Não existe moeda: a gamificação é só XP, nível (`level`) e o progresso até o
  próximo nível (virtual `progress`, com o campo `percentage`).
- `User.streak` está previsto no RF-009 mas nenhuma regra o alimenta hoje —
  é sempre `0` — e `User.badges` vem sempre vazio. O frontend não usa nenhum
  dos dois: as conquistas do perfil são calculadas a partir do
  `mission_progress` (`src/lib/achievements.ts`).
