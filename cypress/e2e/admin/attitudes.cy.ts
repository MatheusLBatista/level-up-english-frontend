import users from "../../fixtures/users.json";
import { envelope, type Attitude, type Page } from "../../support/api-types";
import type { ApiSession } from "../../support/session";

const dialog = '[role="dialog"]';
const alertDialog = '[role="alertdialog"]';

/** Mesma regra de src/lib/attitudes.ts: punição tira XP. */
function signedXp(attitude: Attitude) {
  const xp =
    attitude.type === "negative" ? -attitude.xp_value : attitude.xp_value;

  return `${xp > 0 ? "+" : ""}${xp} XP`;
}

function attitudeCard(name: string) {
  return cy.contains("main ul > li", name);
}

// Criar, editar, desativar e reativar são simulados, para as atitudes da
// demonstração não mudarem.
describe("Atitudes do admin", () => {
  let session: ApiSession;
  let attitudes: Attitude[];

  beforeEach(() => {
    cy.loginByApi(users.admin.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<Page<Attitude>>(
          "/attitudes?limit=100&active=true",
          created.accessToken,
        );
      })
      .then((page) => {
        attitudes = page.docs;
        cy.visitWithSession("/atitudes", session);
      });
  });

  it("lista as atitudes ativas com o XP com sinal", () => {
    cy.contains("h1", "Atitudes de aula").should("be.visible");
    cy.get("main ul > li").should("have.length", attitudes.length);

    attitudes.forEach((attitude) => {
      attitudeCard(attitude.name).should("contain", signedXp(attitude));
    });
  });

  it("mostra as desativadas e reativa uma", () => {
    cy.apiGet<Page<Attitude>>(
      "/attitudes?limit=100&active=false",
      session.accessToken,
    ).then((inactive) => {
      const attitude = inactive.docs[0];

      cy.intercept("PATCH", `**/attitudes/${attitude._id}`, {
        body: envelope({ ...attitude, active: true }),
      }).as("reactivate");

      cy.contains("button", "Desativadas").click();

      cy.location("search").should("contain", "status=desativadas");
      attitudeCard(attitude.name).should("contain", "Desativada");
      // Desativada não se edita, só se reativa.
      cy.get(`[aria-label="Editar ${attitude.name}"]`).should("not.exist");
      cy.get(`[aria-label="Reativar ${attitude.name}"]`).click();

      cy.wait("@reactivate")
        .its("request.body")
        .should("deep.eq", { active: true });
    });
  });

  describe("Nova atitude", () => {
    beforeEach(() => {
      cy.contains("button", "Nova atitude").click();
    });

    it("não aceita nome curto nem XP zero", () => {
      cy.intercept("POST", "**/attitudes").as("create");

      cy.get("#attitude-name").type("A");
      cy.get("#attitude-xp").clear().type("0");
      cy.contains(`${dialog} button`, "Salvar atitude").click();

      cy.contains("Use pelo menos 2 letras no nome.").should("be.visible");
      cy.contains("Use um valor diferente de zero.").should("be.visible");
      cy.get("@create.all").should("have.length", 0);
    });

    it("cria uma punição a partir do XP negativo e mostra a prévia", () => {
      cy.intercept("POST", "**/attitudes", (request) => {
        request.reply({
          body: envelope({
            _id: "new-attitude",
            active: true,
            ...request.body,
          }),
        });
      }).as("create");

      cy.get("#attitude-name").type("Uso de fone");
      cy.get("#attitude-xp").clear().type("-8");
      cy.get("#attitude-description").type("Fone de ouvido durante a aula.");

      cy.get('[aria-label="Prévia do card"]')
        .should("contain", "Uso de fone")
        .and("contain", "-8 XP");
      cy.contains(`${dialog} button`, "Salvar atitude").click();

      // O backend guarda o XP sem sinal e o tipo à parte.
      cy.wait("@create").its("request.body").should("deep.eq", {
        name: "Uso de fone",
        description: "Fone de ouvido durante a aula.",
        xp_value: 8,
        type: "negative",
      });
      cy.get(dialog).should("not.exist");
    });
  });

  it("edita uma punição mostrando o XP com sinal", () => {
    const attitude = attitudes.find((item) => item.type === "negative")!;

    cy.intercept("PATCH", `**/attitudes/${attitude._id}`, (request) => {
      request.reply({ body: envelope({ ...attitude, ...request.body }) });
    }).as("update");

    cy.get(`[aria-label="Editar ${attitude.name}"]`).click();
    cy.get("#attitude-name").should("have.value", attitude.name);
    cy.get("#attitude-xp").should("have.value", String(-attitude.xp_value));

    cy.get("#attitude-xp").clear().type("12");
    cy.contains(`${dialog} button`, "Atualizar atitude").click();

    // Com XP positivo, a punição vira prêmio.
    cy.wait("@update")
      .its("request.body")
      .should("include", { xp_value: 12, type: "positive" });
  });

  it("pede confirmação para desativar", () => {
    const attitude = attitudes[0];

    cy.intercept("PATCH", `**/attitudes/${attitude._id}`, {
      body: envelope({ ...attitude, active: false }),
    }).as("deactivate");

    cy.get(`[aria-label="Desativar ${attitude.name}"]`).click();

    cy.contains(alertDialog, "Desativar atitude?").should(
      "contain",
      attitude.name,
    );
    cy.contains(`${alertDialog} button`, "Desativar").click();

    cy.wait("@deactivate")
      .its("request.body")
      .should("deep.eq", { active: false });
  });
});
