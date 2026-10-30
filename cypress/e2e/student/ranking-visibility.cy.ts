import users from "../../fixtures/users.json";
import type { ApiSession } from "../../support/session";

const visibilitySwitch = "#show-in-global-ranking";
const hiddenNotice = "Você escolheu não aparecer no ranking geral.";

/** Muda a opção direto na API, para preparar e desfazer os testes. */
function setVisibility(session: ApiSession, visible: boolean) {
  cy.request({
    method: "PATCH",
    url: `${Cypress.expose("apiUrl")}/users/${session.user._id}`,
    headers: { Authorization: `Bearer ${session.accessToken}` },
    body: { show_in_global_ranking: visible },
    log: false,
  });
}

/** Vai para o ranking pelo menu, sem recarregar, como o aluno faria. */
function openRanking(scope: "Turma" | "Geral") {
  cy.contains("a", "Ranking").click();
  cy.location("pathname").should("eq", "/ranking");
  cy.contains("button", scope).click();
  cy.contains("h1", scope === "Geral" ? "Ranking geral" : "Ranking da turma");
}

function myRow(session: ApiSession) {
  return cy.contains("main ol > li", session.user.name);
}

// Chamadas reais: o backend recalcula o ranking geral a cada troca. No fim de
// cada teste a opção volta a ficar ligada, para não mudar os outros testes.
describe("Aparecer ou não no ranking geral", () => {
  let session: ApiSession;

  beforeEach(() => {
    cy.loginByApi(users.student.email, users.password).then((created) => {
      session = created;
    });
  });

  afterEach(() => {
    setVisibility(session, true);
  });

  it("desliga no perfil, sai do ranking geral e continua no da turma", () => {
    cy.intercept("PATCH", `**/users/*`).as("update");
    cy.visitWithSession("/perfil", session);

    cy.get(visibilitySwitch).should("have.attr", "aria-checked", "true");
    cy.get(visibilitySwitch).click();

    cy.wait("@update").then(({ request, response }) => {
      expect(request.body).to.deep.eq({ show_in_global_ranking: false });
      expect(response?.statusCode).to.eq(200);
    });
    cy.get(visibilitySwitch).should("have.attr", "aria-checked", "false");

    openRanking("Geral");
    cy.contains(hiddenNotice).should("be.visible");
    cy.contains("a", "no seu perfil").should("have.attr", "href", "/perfil");
    cy.get("main ol > li").should("have.length.greaterThan", 0);
    cy.get("main ol").should("not.contain", session.user.name);

    cy.contains("button", "Turma").click();
    cy.contains("h1", "Ranking da turma").should("be.visible");
    cy.contains(hiddenNotice).should("not.exist");
    myRow(session).should("contain", "Você");
  });

  it("religa no perfil e volta ao ranking geral", () => {
    setVisibility(session, false);
    cy.intercept("PATCH", `**/users/*`).as("update");
    cy.visitWithSession("/perfil", {
      ...session,
      user: { ...session.user, show_in_global_ranking: false },
    });

    cy.get(visibilitySwitch).should("have.attr", "aria-checked", "false");
    cy.get(visibilitySwitch).click();

    cy.wait("@update")
      .its("request.body")
      .should("deep.eq", { show_in_global_ranking: true });
    cy.get(visibilitySwitch).should("have.attr", "aria-checked", "true");

    openRanking("Geral");
    cy.contains(hiddenNotice).should("not.exist");
    myRow(session).should("contain", "Você");
  });
});
