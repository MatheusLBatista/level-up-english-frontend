import users from "../../fixtures/users.json";
import type { ClassSummary, Page, Ranking } from "../../support/api-types";
import type { ApiSession } from "../../support/session";

/** Confere se as linhas da tela seguem a mesma ordem da API. */
function expectRows(ranking: Ranking) {
  cy.get("main ol > li").should("have.length", ranking.entries.length);

  ranking.entries.forEach((entry, index) => {
    cy.get("main ol > li")
      .eq(index)
      .should("contain", entry.user.name)
      .and("contain", `${index + 1}º lugar`);
  });

  // O professor não pontua, então nenhuma linha é dele.
  cy.contains("main ol > li", "Você").should("not.exist");
}

// Diferente do aluno, o professor escolhe qual das suas turmas ver.
describe("Ranking do professor", () => {
  let session: ApiSession;
  let schoolClass: ClassSummary;
  let classRanking: Ranking;
  let globalRanking: Ranking;

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
        return cy.apiGet<Ranking>(
          `/rankings/class/${schoolClass._id}`,
          session.accessToken,
        );
      })
      .then((ranking) => {
        classRanking = ranking;
        return cy.apiGet<Ranking>("/rankings/global", session.accessToken);
      })
      .then((ranking) => {
        globalRanking = ranking;
        cy.visitWithSession("/ranking", session);
      });
  });

  it("abre na turma do professor, com o seletor de turma", () => {
    cy.contains("h1", "Ranking da turma").should("be.visible");
    cy.get('[aria-label="Turma"]').should("contain", schoolClass.name);
    cy.contains(`${schoolClass.name} · Atualizado em`).should("be.visible");

    expectRows(classRanking);
  });

  it("troca para o ranking geral, que não usa o seletor de turma", () => {
    cy.contains("button", "Geral").click();

    cy.location("search").should("contain", "escopo=global");
    cy.contains("h1", "Ranking geral").should("be.visible");
    cy.get('[aria-label="Turma"]').should("not.exist");
    expectRows(globalRanking);

    cy.contains("button", "Turma").click();
    cy.get('[aria-label="Turma"]').should("contain", schoolClass.name);
  });
});
