import users from "../../fixtures/users.json";
import {
  envelope,
  type ClassSummary,
  type Mission,
  type Page,
} from "../../support/api-types";
import type { ApiSession } from "../../support/session";

const PAGE_SIZE = 6;

const dialog = '[role="dialog"]';

/** Preenche a pergunta `number` (começa em 1) do editor de perguntas. */
function fillQuestion(number: number, correct: "a" | "b" | "c" | "d") {
  cy.get(`[id="questions.${number - 1}.question"]`).type(`Pergunta ${number}?`);

  (["a", "b", "c", "d"] as const).forEach((key) => {
    cy.get(
      `[aria-label="Alternativa ${key.toUpperCase()} da pergunta ${number}"]`,
    ).type(`Opção ${key.toUpperCase()}`);
  });

  cy.get(`[aria-label="Alternativa correta da pergunta ${number}"]`)
    .find(`[aria-label="Marcar ${correct.toUpperCase()} como correta"]`)
    .click();
}

// A Carla criou todas as missões do 1º Ano A no seed:demo. Criar, editar e
// desativar são simulados, para as missões da demonstração não mudarem.
describe("Missões do professor", () => {
  let session: ApiSession;
  let schoolClass: ClassSummary;
  let missions: Mission[];

  beforeEach(() => {
    cy.loginByApi(users.teacher.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<Page<ClassSummary>>(
          `/classes?limit=100&active=true&teacher=${created.user._id}`,
          created.accessToken,
        );
      })
      .then((classes) => {
        schoolClass = classes.docs[0];
        return cy.apiGet<Page<Mission>>(
          `/missions?limit=100&class_id=${schoolClass._id}`,
          session.accessToken,
        );
      })
      .then((page) => {
        missions = page.docs;
      });
  });

  it("lista as missões da turma com paginação e filtro por tipo", () => {
    const totalPages = Math.ceil(missions.length / PAGE_SIZE);

    cy.visitWithSession("/missoes", session);

    cy.contains("h1", "Missões").should("be.visible");
    cy.get('[aria-label="Turma"]').should("contain", schoolClass.name);
    cy.get("main h3").should(
      "have.length",
      Math.min(PAGE_SIZE, missions.length),
    );
    cy.contains(`Página 1 de ${totalPages}`).should("be.visible");

    cy.contains("button", "Próxima").click();
    cy.location("search").should("contain", "pagina=2");
    cy.get("main h3").should("have.length", missions.length - PAGE_SIZE);

    cy.contains("button", "Quiz").click();
    cy.location("search").should("contain", "tipo=quiz");
    cy.get("main h3").should(
      "have.length",
      missions.filter((mission) => mission.type === "quiz").length,
    );
  });

  describe("Criar missão", () => {
    beforeEach(() => {
      cy.visitWithSession("/missoes", session);
      cy.contains("button", "Criar missão").click();
      cy.contains(dialog, "Nova missão").should("be.visible");
    });

    it("valida o quiz antes de chamar a API", () => {
      cy.intercept("POST", "**/missions").as("create");

      cy.get("#title").clear();
      cy.contains(`${dialog} button`, "Criar missão").click();

      cy.contains("Dê um título à missão.").should("be.visible");
      cy.contains("Escreva a pergunta.").should("be.visible");
      cy.contains("Preencha a alternativa.").should("be.visible");
      cy.get("@create.all").should("have.length", 0);
    });

    it("pede o conteúdo de vocabulário e um link válido de áudio", () => {
      cy.get("#title").type("Colors");

      cy.contains(`${dialog} button`, "Vocabulário").click();
      cy.contains(`${dialog} button`, "Criar missão").click();
      cy.contains("Missões de vocabulário precisam de conteúdo.").should(
        "be.visible",
      );

      cy.contains(`${dialog} button`, "Áudio").click();
      cy.get("#content_url").type("youtube.com/sem-https");
      cy.contains(`${dialog} button`, "Criar missão").click();
      cy.contains(
        "Link inválido. Use um endereço completo, com https://.",
      ).should("be.visible");
    });

    it("cria um quiz com cinco perguntas", () => {
      cy.intercept("POST", "**/missions", (request) => {
        request.reply({
          body: envelope({ _id: "new-mission", ...request.body }),
        });
      }).as("create");

      cy.get("#title").type("Colors");
      cy.get("#description").type("As cores em inglês.");
      cy.get("#xp_reward").clear().type("120");

      fillQuestion(1, "a");
      fillQuestion(2, "b");
      fillQuestion(3, "c");
      fillQuestion(4, "d");
      fillQuestion(5, "a");

      cy.contains(`${dialog} button`, "Criar missão").click();

      cy.wait("@create")
        .its("request.body")
        .should((body) => {
          expect(body).to.include({
            type: "quiz",
            title: "Colors",
            description: "As cores em inglês.",
            xp_reward: 120,
            class_id: schoolClass._id,
          });
          expect(
            body.questions.map(
              (question: { correct_answer: string }) => question.correct_answer,
            ),
          ).to.deep.eq(["a", "b", "c", "d", "a"]);
          expect(body.questions[0]).to.deep.eq({
            question: "Pergunta 1?",
            options: { a: "Opção A", b: "Opção B", c: "Opção C", d: "Opção D" },
            correct_answer: "a",
          });
        });
      cy.get(dialog).should("not.exist");
    });
  });

  it("edita uma missão sem deixar trocar o tipo", () => {
    const mission = missions[0];

    cy.intercept("PATCH", `**/missions/${mission._id}`, (request) => {
      request.reply({ body: envelope({ ...mission, ...request.body }) });
    }).as("update");

    cy.visitWithSession("/missoes", session);
    cy.get(`[aria-label="Editar ${mission.title}"]`).click();

    cy.contains(dialog, "Editar missão").should("be.visible");
    cy.get("#title").should("have.value", mission.title);
    cy.contains("O tipo não pode ser alterado").should("be.visible");
    cy.get(`${dialog} [aria-pressed]`).each((button) => {
      cy.wrap(button).should("be.disabled");
    });

    cy.get("#title").clear().type(`${mission.title} (revisada)`);
    cy.contains(`${dialog} button`, "Salvar alterações").click();

    cy.wait("@update")
      .its("request.body.title")
      .should("eq", `${mission.title} (revisada)`);
    cy.get(dialog).should("not.exist");
  });

  it("pede confirmação para desativar uma missão", () => {
    const mission = missions[0];

    cy.intercept("PATCH", `**/missions/${mission._id}`, {
      body: envelope({ ...mission, active: false }),
    }).as("deactivate");

    cy.visitWithSession("/missoes", session);
    cy.get(`[aria-label="Desativar ${mission.title}"]`).click();

    cy.contains('[role="alertdialog"]', "Desativar missão?").should(
      "contain",
      mission.title,
    );
    cy.contains('[role="alertdialog"] button', "Cancelar").click();
    cy.get('[role="alertdialog"]').should("not.exist");
    cy.get("@deactivate.all").should("have.length", 0);

    cy.get(`[aria-label="Desativar ${mission.title}"]`).click();
    cy.contains('[role="alertdialog"] button', "Desativar").click();

    cy.wait("@deactivate")
      .its("request.body")
      .should("deep.eq", { active: false });
    cy.get('[role="alertdialog"]').should("not.exist");
  });

  it("reativa uma missão desativada", () => {
    const mission = missions[0];

    // Nenhuma missão do seed está desativada: a lista vem do backend com a
    // primeira marcada como inativa.
    cy.intercept("GET", "**/missions?*", (request) => {
      request.continue((response) => {
        response.body.data.docs.forEach(
          (item: Mission & { active: boolean }) => {
            if (item._id === mission._id) {
              item.active = false;
            }
          },
        );
      });
    });
    cy.intercept("PATCH", `**/missions/${mission._id}`, {
      body: envelope({ ...mission, active: true }),
    }).as("reactivate");

    cy.visitWithSession("/missoes", session);

    cy.contains("Inativa").should("be.visible");
    cy.get(`[aria-label="Reativar ${mission.title}"]`).click();

    cy.wait("@reactivate")
      .its("request.body")
      .should("deep.eq", { active: true });
  });
});
