import users from "../../fixtures/users.json";
import type { AttitudeLog, ClassSummary, Page } from "../../support/api-types";
import type { ApiSession } from "../../support/session";

/** Card "Suas turmas" (o crachá também lista as turmas, em chips). */
function classesCard() {
  return cy.contains('[data-slot="card"]', "Suas turmas");
}

describe("Perfil do professor", () => {
  let session: ApiSession;
  let classes: ClassSummary[];

  beforeEach(() => {
    cy.loginByApi(users.teacher.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<Page<ClassSummary>>(
          `/classes?limit=100&active=true&teacher=${created.user._id}`,
          created.accessToken,
        );
      })
      .then((page) => {
        classes = page.docs;
        cy.visitWithSession("/perfil", session);
      });
  });

  it("mostra o crachá com nome, e-mail e turmas", () => {
    cy.contains("h1", "Meu perfil").should("be.visible");
    cy.contains("Professor · LevelUp English").should("be.visible");
    cy.contains("h2", session.user.name).should("be.visible");
    cy.contains(users.teacher.email).should("be.visible");

    classes.forEach((item) => {
      cy.get('[aria-label="Turmas"]').should("contain", item.name);
    });
  });

  it("troca a foto pelo avatar do crachá", () => {
    cy.get('[aria-label="Trocar foto de perfil"]').click();

    cy.contains('[role="dialog"]', "Foto de perfil")
      .should("contain", "JPEG, PNG ou WebP de até 2 MB")
      .find("button")
      .contains("Salvar foto")
      .should("be.disabled");
  });

  it("lista as turmas com alunos, missões e atalhos", () => {
    classes.forEach((item) => {
      classesCard()
        .contains("li", item.name)
        .should(
          "contain",
          `${item.students.length} alunos · ${item.missions.length} missões`,
        )
        .within(() => {
          cy.contains("a", "Painel").should(
            "have.attr",
            "href",
            `/painel?turma=${item._id}`,
          );
          cy.contains("a", "Missões").should(
            "have.attr",
            "href",
            `/missoes?turma=${item._id}`,
          );
        });
    });

    classesCard()
      .contains("li", classes[0].name)
      .contains("a", "Painel")
      .click();
    cy.location("pathname").should("eq", "/painel");
    cy.location("search").should("eq", `?turma=${classes[0]._id}`);
  });

  it("mostra as atitudes aplicadas mais recentes", () => {
    cy.apiGet<Page<AttitudeLog>>(
      `/attitude-logs?teacher=${session.user._id}&limit=6`,
      session.accessToken,
    ).then((logs) => {
      const [latest] = logs.docs;

      cy.contains(`${logs.totalDocs} atitudes aplicadas`).should("be.visible");
      cy.contains("li", latest.student!.name).should(
        "contain",
        latest.attitude!.name,
      );
    });
  });
});
