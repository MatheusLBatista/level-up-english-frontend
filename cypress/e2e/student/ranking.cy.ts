import users from "../../fixtures/users.json";
import type { Ranking } from "../../support/api-types";
import type { ApiSession } from "../../support/session";

/** Confere se as linhas da tela seguem a mesma ordem da API. */
function expectRows(ranking: Ranking, userId: string) {
  cy.get("main ol > li").should("have.length", ranking.entries.length);

  ranking.entries.forEach((entry, index) => {
    cy.get("main ol > li")
      .eq(index)
      .should("contain", entry.user.name)
      .and("contain", `${index + 1}º lugar`);
  });

  const mine = ranking.entries.findIndex((entry) => entry.user._id === userId);
  cy.get("main ol > li").eq(mine).should("contain", "Você");
  cy.get("main ol > li").first().should("contain", "1º lugar");
}

describe("Ranking do aluno", () => {
  let session: ApiSession;
  let classRanking: Ranking;
  let globalRanking: Ranking;

  beforeEach(() => {
    cy.loginByApi(users.student.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<Ranking>("/rankings/me", created.accessToken);
      })
      .then((ranking) => {
        classRanking = ranking;
        return cy.apiGet<Ranking>("/rankings/global", session.accessToken);
      })
      .then((ranking) => {
        globalRanking = ranking;
      });
  });

  it("abre na turma, na mesma ordem da API e com o aluno destacado", () => {
    cy.visitWithSession("/ranking", session);

    cy.contains("h1", "Ranking da turma").should("be.visible");
    cy.contains(classRanking.class!.name).should("be.visible");
    expectRows(classRanking, session.user._id);
  });

  it("troca para o ranking geral e guarda a escolha na URL", () => {
    cy.visitWithSession("/ranking", session);

    cy.contains("button", "Geral").click();

    cy.location("search").should("eq", "?escopo=global");
    cy.contains("h1", "Ranking geral").should("be.visible");
    expectRows(globalRanking, session.user._id);

    cy.reload();
    cy.contains("h1", "Ranking geral").should("be.visible");

    cy.contains("button", "Turma").click();
    cy.contains("h1", "Ranking da turma").should("be.visible");
  });
});
