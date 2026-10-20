import users from "../fixtures/users.json";
import type { ApiSession } from "../support/session";

type Mission = {
  _id: string;
  title: string;
  type: "quiz" | "vocabulary" | "audio";
  questions?: { question: string; options: Record<string, string> }[];
};

type MissionProgress = { mission_id: string; done: boolean; score: number };

type User = { _id: string; mission_progress: MissionProgress[] };

type Page<T> = { docs: T[] };

// O Arthur entrou na turma há pouco no seed:demo e não fez nenhuma missão, então
// todas aparecem como pendentes. A entrega é simulada para continuar assim.
describe("Missões do aluno", () => {
  let session: ApiSession;
  let missions: Mission[];
  let quiz: Mission;

  beforeEach(() => {
    cy.loginByApi(users.newStudent.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<Page<Mission>>(
          "/missions?limit=100&active=true",
          created.accessToken,
        );
      })
      .then((page) => {
        missions = page.docs;
        quiz = page.docs.find((mission) => mission.type === "quiz")!;
      });
  });

  /** Abre o quiz e responde as `count` primeiras questões com a alternativa. */
  function answerQuiz(count: number, option = "a") {
    cy.visitWithSession(`/missoes/${quiz._id}`, session);

    quiz.questions!.slice(0, count).forEach((question, index) => {
      cy.contains("legend", question.question).should("be.visible");
      cy.contains("label", question.options[option]).click();

      if (index < quiz.questions!.length - 1) {
        cy.contains("button", "Próxima").click();
      }
    });
  }

  it("lista as missões da turma e filtra por tipo", () => {
    cy.visitWithSession("/missoes", session);

    cy.contains(`${missions.length} missões ainda rendem XP`).should(
      "be.visible",
    );
    missions.forEach((mission) => {
      cy.contains("h3", mission.title).should("be.visible");
    });

    cy.contains("button", "Quiz").click();

    cy.location("search").should("eq", "?tipo=quiz");
    missions.forEach((mission) => {
      cy.contains("h3", mission.title).should(
        mission.type === "quiz" ? "be.visible" : "not.exist",
      );
    });

    cy.contains("button", "Todas").click();
    cy.location("search").should("eq", "");
  });

  it("resolve um quiz e mostra a nota e o XP ganho", () => {
    cy.intercept("POST", `**/missions/${quiz._id}/progress`, {
      body: {
        message: "ok",
        errors: [],
        data: {
          mission: quiz._id,
          student: session.user._id,
          done: true,
          score: 80,
          best_score: 80,
          correct_answers: 4,
          total_questions: 5,
          xp_earned: 120,
          credited_so_far: 120,
          already_rewarded: false,
          progression: {
            previous_level: 1,
            leveled_up: true,
            leveled_down: false,
            level: 2,
            xp: 120,
          },
        },
      },
    }).as("submit");

    answerQuiz(quiz.questions!.length);
    cy.contains("button", "Entregar").click();

    cy.wait("@submit")
      .its("request.body")
      .should("deep.eq", {
        done: true,
        answers: quiz.questions!.map(() => "a"),
      });
    cy.contains("Missão entregue").should("be.visible");
    cy.contains("+120 XP").should("be.visible");
    cy.contains("Você acertou 4 de 5 (80%).").should("be.visible");
    cy.contains("Você subiu para o nível 2!").should("be.visible");
  });

  it("só deixa entregar com todas as questões respondidas", () => {
    cy.intercept("POST", `**/missions/${quiz._id}/progress`).as("submit");

    answerQuiz(1);
    cy.get('[aria-label^="Questão 5"]').click();

    cy.contains("Faltam as questões 2, 3, 4 e 5.").should("be.visible");
    cy.contains("button", "Entregar").should("be.disabled");

    // Os números da frase levam direto à questão que falta.
    cy.contains("p", "Faltam as questões").contains("button", "2").click();
    cy.contains("Questão 2 de 5").should("be.visible");
    cy.get("@submit.all").should("have.length", 0);
  });

  it("guarda as respostas ao recarregar a página", () => {
    answerQuiz(2, "b");

    cy.reload();

    cy.contains("Questão 3 de 5").should("be.visible");
    cy.get('[aria-label="Questão 1, respondida"]').should("exist");
    cy.get('[aria-label="Questão 2, respondida"]').click();
    cy.get('input[type="radio"][value="b"]').should("be.checked");
  });

  it("pede confirmação para sair no meio da missão", () => {
    answerQuiz(1);

    cy.contains("main button", "Missões").click();
    cy.contains('[role="alertdialog"]', "Sair da missão?")
      .should("be.visible")
      .and("contain", "Você respondeu 1 de 5");

    cy.contains("button", "Continuar a missão").click();
    cy.get('[role="alertdialog"]').should("not.exist");
    cy.location("pathname").should("eq", `/missoes/${quiz._id}`);

    cy.contains("main button", "Missões").click();
    cy.contains('[role="alertdialog"] button', "Sair").click();

    cy.location("pathname").should("eq", "/missoes");
    cy.get(`a[href="/missoes/${quiz._id}"]`).should("contain", "Continuar");
  });

  it("avisa quando a missão é de outra turma", () => {
    cy.loginByApi(users.student.email, users.password)
      .then((other) =>
        cy.apiGet<Page<Mission>>("/missions?limit=1", other.accessToken),
      )
      .then((page) => {
        cy.visitWithSession(`/missoes/${page.docs[0]._id}`, session);
      });

    cy.contains("Esta missão é de outra turma.").should("be.visible");
    cy.contains("a", "Voltar às missões").should(
      "have.attr",
      "href",
      "/missoes",
    );
  });

  it("avisa quando a missão não existe", () => {
    cy.visitWithSession("/missoes/000000000000000000000000", session);

    cy.contains("Não encontramos esta missão").should("be.visible");
  });
});

// A Ana é a aluna destaque do seed:demo e já tirou 100% em quizzes.
describe("Missão já concluída", () => {
  it("mostra a missão como concluída e não deixa refazer", () => {
    cy.loginByApi(users.student.email, users.password).then((session) => {
      cy.apiGet<User>(`/users/${session.user._id}`, session.accessToken).then(
        (user) => {
          const perfect = user.mission_progress.find(
            (entry) => entry.done && entry.score === 100,
          )!;

          cy.visitWithSession(`/missoes/${perfect.mission_id}`, session);
        },
      );
    });

    cy.contains("Missão concluída").should("be.visible");
    cy.contains("Você já tirou nota máxima aqui").should("be.visible");
    cy.contains("button", "Entregar").should("not.exist");
  });
});
