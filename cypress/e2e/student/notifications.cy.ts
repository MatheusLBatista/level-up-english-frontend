import users from "../../fixtures/users.json";
import { envelope } from "../../support/api-types";
import type { ApiSession } from "../../support/session";

const bell = 'header button[title="Notificações"]';

function stubUnread(unread: number) {
  cy.intercept("GET", "**/notifications/unread-count", {
    body: envelope({ unread }),
  }).as("unread");
}

function setTabVisibility(state: "visible" | "hidden") {
  cy.document().then((doc) => {
    Object.defineProperty(doc, "visibilityState", {
      configurable: true,
      get: () => state,
    });
    doc.dispatchEvent(new Event("visibilitychange", { bubbles: true }));
  });
}

describe("Sino de notificações", () => {
  let session: ApiSession;

  beforeEach(() => {
    cy.loginByApi(users.student.email, users.password).then((created) => {
      session = created;
    });
  });

  it("mostra 9+ quando há mais de nove não lidas", () => {
    stubUnread(12);

    cy.visitWithSession("/dashboard", session);

    cy.get(bell)
      .should("have.attr", "aria-label", "Notificações, 12 não lidas")
      .find('[data-slot="notification-count"]')
      .should("have.text", "9+");
  });

  it("mostra o número exato até nove e some sem não lidas", () => {
    stubUnread(3);
    cy.visitWithSession("/dashboard", session);

    cy.get(bell)
      .should("have.attr", "aria-label", "Notificações, 3 não lidas")
      .find('[data-slot="notification-count"]')
      .should("have.text", "3");

    stubUnread(0);
    cy.visitWithSession("/dashboard", session);

    cy.get(bell)
      .should("have.attr", "aria-label", "Notificações")
      .find('[data-slot="notification-count"]')
      .should("not.exist");
  });

  it("consulta a cada minuto e pausa com a aba oculta", () => {
    stubUnread(1);
    cy.clock();

    cy.visitWithSession("/dashboard", session);
    cy.wait("@unread");

    cy.tick(60 * 1000);
    cy.wait("@unread");

    setTabVisibility("hidden");
    cy.tick(3 * 60 * 1000);
    cy.get("@unread.all").should("have.length", 2);

    setTabVisibility("visible");
    cy.wait("@unread");
    cy.get("@unread.all").should("have.length", 3);
  });

  it("para de consultar depois do logout", () => {
    stubUnread(1);
    cy.clock();

    cy.visitWithSession("/dashboard", session);
    cy.wait("@unread");

    cy.contains("button", "Sair").click();
    cy.location("pathname").should("eq", "/login");

    cy.tick(3 * 60 * 1000);
    cy.get("@unread.all").should("have.length", 1);
  });

  it("não aparece para o professor", () => {
    cy.loginByApi(users.teacher.email, users.password).then((teacher) => {
      cy.visitWithSession("/painel", teacher);
    });

    cy.get('header [aria-label="Alternar entre tema claro e escuro"]').should(
      "be.visible",
    );
    cy.get(bell).should("not.exist");
  });
});
