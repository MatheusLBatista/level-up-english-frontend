# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Alunos (público principal):** estudantes de inglês do ensino médio ou de
  cursinhos de inglês. Usam a plataforma principalmente **em casa**, fora da
  aula, e na maior parte das vezes pelo celular. A tarefa deles é concluir as
  missões que o professor publicou para a turma, ganhar XP, subir de nível e
  acompanhar a própria posição no ranking.
- **Professores:** criam e mantêm as missões das próprias turmas e acompanham
  os alunos pelo Painel: aplicam atitudes (dão ou tiram XP por comportamento
  em sala), ajustam XP manualmente, cadastram alunos nas próprias turmas e
  consultam a ficha de cada aluno com o histórico de XP.
- **Admin (coordenação da escola ou do cursinho):** organiza turmas,
  professores, alunos e o catálogo de atitudes, e tem acesso ao mesmo Painel do
  professor para todas as turmas.

## Product Purpose

A LevelUp English é uma plataforma de gamificação para o aprendizado de inglês.
Ela transforma a prática que o professor propõe em missões com recompensa
(XP, níveis, conquistas e ranking), para manter o aluno praticando em casa
entre uma aula e outra. Sucesso é o aluno voltar por conta própria para
concluir e refazer missões, e o professor conseguir acompanhar e influenciar
essa evolução sem sair da plataforma.

O projeto é o Trabalho de Conclusão de Curso (TCC) de quem o desenvolve.

## Positioning

**O professor está no centro.** Diferente de um curso genérico (como o
Duolingo), o conteúdo e a recompensa vêm do professor real da turma: ele cria
as missões da própria turma e dá ou tira XP por atitudes em sala. A
gamificação reflete a aula de verdade, e o ranking compara colegas da mesma
turma e da mesma escola.

## Operating Context

- O aluno resolve missões sozinho, em casa, geralmente no celular, sem o
  professor por perto. A tela precisa se explicar sozinha.
- O professor usa o Painel para agir sobre a turma inteira ou sobre vários
  alunos de uma vez (seleção múltipla para aplicar atitudes).
- Cada pessoa entra com e-mail e senha criados pela escola; não há cadastro
  aberto. O primeiro acesso chega por um link para criar a senha.
- O app é usado em português; o conteúdo das missões é em inglês.

## Capabilities and Constraints

- **Papéis:** aluno, professor e admin. A navegação muda por papel, e o backend
  confere a permissão em toda requisição.
- **Missões:** tipos quiz, vocabulário e áudio, com perguntas de 4 alternativas
  (a–d). O XP é proporcional aos acertos; refazer a missão só credita a
  diferença sobre a melhor tentativa. O título é único por turma.
- **Atitudes:** catálogo de prêmios e punições em XP aplicados pelo professor.
  O XP pode cair; por isso o nível pode regredir.
- **Conquistas:** calculadas a partir do progresso nas missões (missões
  concluídas, notas máximas, XP ganho em missões); nenhuma regride.
- **Histórico de XP:** missões, atitudes e ajustes manuais, visível ao aluno e,
  na ficha do aluno, ao professor e ao admin.
- **Ranking:** geral e por turma.
- **Sem moedas:** a economia é só XP e nível.
- **Desativar em vez de excluir:** turmas, alunos, professores, missões e
  atitudes são desativados e podem ser reativados, preservando o histórico.
- **A resposta certa de cada questão nunca chega ao aluno** (o backend omite
  `correct_answer`), porque refazer a missão rende XP.
- **Limite de tentativas** no login, na recuperação de senha e na criação de
  senha (respostas 429).
- **Técnico:** frontend Next.js 16 (App Router), React 19, Tailwind CSS 4,
  shadcn/ui; backend Express + MongoDB em repositório separado
  (`../level-up-english`). O app usa sempre o tema escuro.
- **Em aberto:** o campo `streak` existe no banco, mas não é usado; o backend
  guarda só a nota de cada missão, não as respostas de cada tentativa.

## Brand Commitments

- **Nome:** LevelUp English, com o subtítulo "English Learning".
- **Logo:** ainda provisória (ícone de controle de videogame do Lucide sobre o
  gradiente da marca). O autor pode criar uma logo própria; até lá, nenhuma
  tela deve inventar outra.
- **Instituição:** nenhum nome ou logo de instituição precisa aparecer.
- **Voz:** português direto e próximo, falando com o aluno por "você".

## Evidence on Hand

- Dados de demonstração gerados por seeds no backend (`src/seeds/`): turmas
  como "1º Ano A — Manhã", professores, alunos, missões e progresso fictícios.
- Não há depoimentos, números de uso, clientes, escolas parceiras nem
  resultados de testes com usuários. Nenhuma tela deve inventá-los.

## Product Principles

1. **O professor manda no conteúdo.** Toda missão, recompensa e punição vem de
   uma pessoa real da turma; a interface deixa claro de quem veio cada XP.
2. **O aluno entende sozinho.** Ele usa a plataforma em casa, sem ajuda: cada
   tela diz o que fazer a seguir e por que ganhou ou perdeu XP.
3. **Recompensa honesta.** XP, nível e conquistas refletem esforço real;
   refazer missão não infla pontos, e o histórico mostra cada mudança.
4. **Celular primeiro.** Tudo precisa funcionar bem em tela pequena antes de
   ganhar espaço no desktop.
5. **Nada se perde.** Desativar em vez de excluir, para que o histórico de cada
   aluno continue íntegro.

## Accessibility & Inclusion

- Contraste e navegação por teclado no nível **WCAG 2.2 AA** são exigência do
  trabalho.
- Celular primeiro: alvos de toque confortáveis e layouts que funcionam a
  partir de 375px de largura.
