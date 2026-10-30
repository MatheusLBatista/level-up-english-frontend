import users from "../../fixtures/users.json";
import {
  envelope,
  performanceSummary,
  type Performance,
} from "../../support/api-types";
import type { ApiSession } from "../../support/session";

const DAY_MS = 24 * 60 * 60 * 1000;

function radarSection() {
  return cy.contains("section", "Desempenho por tipo de missão");
}

// A Ana já concluiu missões dos três tipos no seed:demo. Os casos de nota
// vazia e de aluno sem turma são simulados.
describe("Radar de desempenho do aluno", () => {
  let session: ApiSession;
  let performance: Performance;

  beforeEach(() => {
    cy.loginByApi(users.student.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<Performance>(
          `/users/${created.user._id}/performance`,
          created.accessToken,
        );
      })
      .then((found) => {
        performance = found;
      });
  });

  it("mostra o radar com as notas do aluno e da turma", () => {
    cy.visitWithSession("/dashboard", session);

    radarSection().within(() => {
      cy.get("svg.recharts-surface").should("be.visible");
      cy.contains(".recharts-legend-wrapper", "Você").should("be.visible");
      cy.contains(".recharts-legend-wrapper", "Média da turma").should(
        "be.visible",
      );
      cy.get('[aria-pressed="true"]').should("have.text", "Tudo");

      performanceSummary(performance, "Você").forEach((line) => {
        cy.get("figcaption").should("contain.text", line);
      });
    });
  });

  it("manda o from ao trocar o período e não manda no Tudo", () => {
    cy.intercept("GET", "**/performance*").as("performance");
    cy.visitWithSession("/dashboard", session);

    cy.wait("@performance")
      .its("request.url")
      .should("not.contain", "from=")
      .and("not.contain", "to=");

    radarSection().within(() => {
      cy.contains("button", "30 dias").click();
      cy.contains("button", "30 dias").should(
        "have.attr",
        "aria-pressed",
        "true",
      );
    });

    cy.wait("@performance").then(({ request, response }) => {
      const params = new URL(request.url).searchParams;
      const from = params.get("from");

      expect(response?.statusCode).to.eq(200);
      expect(params.has("to")).to.eq(false);
      expect(from).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      // Uma folga de 1 minuto para o tempo entre o clique e esta conferência.
      expect(Date.now() - Date.parse(from!)).to.be.closeTo(30 * DAY_MS, 60_000);
    });
  });

  it("mostra tipo sem nota como sem missões e esconde a turma ausente", () => {
    const partial: Performance = {
      student: {
        quiz: { score: 90, missions: 2 },
        vocabulary: { score: null, missions: 0 },
        audio: { score: 60, missions: 1 },
      },
      class: null,
    };

    cy.intercept("GET", "**/performance*", { body: envelope(partial) });
    cy.visitWithSession("/dashboard", session);

    radarSection().within(() => {
      cy.get("svg.recharts-surface").should("be.visible");
      cy.get("figcaption")
        .should("contain.text", "Vocabulário: Você Sem missões concluídas")
        .and("not.contain.text", "média da turma");
      cy.get(".recharts-legend-wrapper").should(
        "not.contain",
        "Média da turma",
      );
    });
  });

  it("mostra o estado vazio quando nenhum tipo tem nota", () => {
    const empty = { score: null, missions: 0 };

    cy.intercept("GET", "**/performance*", {
      body: envelope({
        student: { quiz: empty, vocabulary: empty, audio: empty },
        class: null,
      }),
    });
    cy.visitWithSession("/dashboard", session);

    radarSection().within(() => {
      cy.contains(
        "Conclua missões para ver seu desempenho em cada tipo.",
      ).should("be.visible");
      cy.get("svg.recharts-surface").should("not.exist");
    });
  });
});
