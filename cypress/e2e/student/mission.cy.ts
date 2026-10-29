import users from "../../fixtures/users.json";
import type {
  Mission,
  MissionProgress,
  Page,
  User,
} from "../../support/api-types";
import type { ApiSession } from "../../support/session";

/** Responde as `count` primeiras questões na ordem em que aparecem na tela. */
function answerQuestions(
  mission: Mission,
  count: number,
  pick: (index: number) => string = () => "a",
) {
  const questions = mission.questions!;

  Cypress._.times(count, (position) => {
    cy.get("legend")
      .should("be.visible")
      .invoke("text")
      .then((text) => {
        const index = questions.findIndex((item) => item.question === text);

        cy.get(`input[type="radio"][value="${pick(index)}"]`)
          .closest("label")
          .click();
      });

    if (position < questions.length - 1) {
      cy.contains("button", "Próxima").click();
    }
  });
}

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
    answerQuestions(quiz, count, () => option);
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

  it("mantém as respostas quando a entrega falha", () => {
    cy.intercept("POST", `**/missions/${quiz._id}/progress`, {
      statusCode: 500,
      body: { message: "Erro interno do servidor.", data: null, errors: [] },
    }).as("submit");

    answerQuiz(quiz.questions!.length);
    cy.contains("button", "Entregar").click();
    cy.wait("@submit");

    cy.contains(
      '[role="alert"]',
      "Erro interno do servidor. Suas respostas continuam aqui.",
    ).should("be.visible");
    cy.get('input[type="radio"][value="a"]').should("be.checked");
    cy.get('[aria-label$=", respondida"]').should(
      "have.length",
      quiz.questions!.length,
    );
    cy.contains("button", "Entregar").should("be.enabled");
  });

  it("mostra o material antes das perguntas de vocabulário", () => {
    const vocabulary = missions.find(
      (mission) => mission.type === "vocabulary",
    )!;

    cy.visitWithSession(`/missoes/${vocabulary._id}`, session);

    cy.contains("h2", "Estude antes de responder").should("be.visible");
    cy.contains(vocabulary.description).should("be.visible");
    cy.contains("legend", vocabulary.questions![0].question).should(
      "not.exist",
    );

    cy.contains("button", "Começar as perguntas").click();
    cy.contains(`Questão 1 de ${vocabulary.questions!.length}`).should(
      "be.visible",
    );
    cy.contains("legend", vocabulary.questions![0].question).should(
      "be.visible",
    );

    cy.get('[aria-label="Rever o material"]').click();
    cy.contains("h2", "Estude antes de responder").should("be.visible");
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
    cy.get("legend").invoke("text").as("current", { type: "static" });

    cy.reload();

    cy.get<string>("@current").then((text) => {
      cy.contains("legend", text).should("be.visible");
    });
    cy.get('[aria-label$=", respondida"]')
      .should("have.length", 2)
      .first()
      .click();
    cy.get('input[type="radio"][value="b"]').should("be.checked");
  });

  it("entrega as respostas do quiz embaralhado na ordem original", () => {
    const keys = ["a", "b", "c", "d"];
    const pick = (index: number) => keys[index % keys.length];

    cy.intercept("POST", `**/missions/${quiz._id}/progress`, {
      statusCode: 500,
      body: { message: "Erro interno do servidor.", data: null, errors: [] },
    }).as("submit");

    cy.visitWithSession(`/missoes/${quiz._id}`, session);
    answerQuestions(quiz, quiz.questions!.length, pick);
    cy.contains("button", "Entregar").click();

    cy.wait("@submit")
      .its("request.body.answers")
      .should(
        "deep.eq",
        quiz.questions!.map((_, index) => pick(index)),
      );
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

// A Ana é a aluna destaque do seed:demo: tirou 100% em uns quizzes e menos em
// outras missões, que ela ainda pode refazer.
describe("Missões já feitas", () => {
  let session: ApiSession;
  let progress: MissionProgress[];

  beforeEach(() => {
    cy.loginByApi(users.student.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<User>(
          `/users/${created.user._id}`,
          created.accessToken,
        );
      })
      .then((user) => {
        progress = user.mission_progress;
      });
  });

  it("mostra a missão como concluída e não deixa refazer", () => {
    const perfect = progress.find(
      (entry) => entry.done && entry.score === 100,
    )!;

    cy.visitWithSession(`/missoes/${perfect.mission_id}`, session);

    cy.contains("Missão concluída").should("be.visible");
    cy.contains("Você já tirou nota máxima aqui").should("be.visible");
    cy.contains("button", "Entregar").should("not.exist");
  });

  it("deixa refazer abaixo de 100% e só paga o que passar da melhor nota", () => {
    const best = progress.find((entry) => entry.done && entry.score < 100)!;

    cy.apiGet<Mission>(
      `/missions/${best.mission_id}`,
      session.accessToken,
    ).then((mission) => {
      cy.intercept("POST", `**/missions/${mission._id}/progress`, {
        body: {
          message: "ok",
          errors: [],
          data: {
            mission: mission._id,
            student: session.user._id,
            done: true,
            score: 0,
            best_score: best.score,
            correct_answers: 0,
            total_questions: mission.questions!.length,
            xp_earned: 0,
            credited_so_far: best.xp_earned,
            already_rewarded: true,
            progression: null,
          },
        },
      }).as("submit");

      cy.visitWithSession(`/missoes/${mission._id}`, session);

      cy.contains(`Sua melhor nota aqui é ${best.score}%`)
        .should("be.visible")
        .and("contain", `até +${mission.xp_reward - best.xp_earned} XP`);

      cy.contains("button", "Começar as perguntas").click();
      answerQuestions(mission, mission.questions!.length);
      cy.contains("button", "Entregar").click();
      cy.wait("@submit");

      cy.contains("0 XP").should("be.visible");
      cy.contains(
        `Sua melhor nota nesta missão continua ${best.score}%.`,
      ).should("be.visible");
      cy.contains(
        `Nenhum XP novo: sua melhor tentativa já rendeu ${best.xp_earned} de ${mission.xp_reward} XP.`,
      ).should("be.visible");

      // Tentar de novo começa do zero, pelo material.
      cy.contains("button", "Tentar de novo").click();
      cy.contains("h2", "Estude antes de responder").should("be.visible");
      cy.contains("button", "Começar as perguntas").click();
      cy.get('input[type="radio"]:checked').should("not.exist");
    });
  });
});
