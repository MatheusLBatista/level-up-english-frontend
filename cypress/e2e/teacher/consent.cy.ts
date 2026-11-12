import users from "../../fixtures/users.json";
import {
  envelope,
  type ClassSummary,
  type Page,
  type User,
} from "../../support/api-types";
import type { ApiSession } from "../../support/session";

const dialog = '[role="dialog"]';
const alertDialog = '[role="alertdialog"]';

function openSheet(name: string) {
  cy.get(`[aria-label="Ver ficha de ${name}"]`).click();
  cy.get(dialog).should("contain", name);
}

// No seed:demo o único aluno com termo pendente é de outra turma. Aqui a
// lista da turma da Carla vem real, só com o termo do primeiro aluno zerado
// na resposta. Registrar, revogar e mudar o ranking são simulados, para a
// demonstração não mudar.
describe("LGPD no painel do professor", () => {
  let session: ApiSession;
  let student: User;
  let schoolClass: ClassSummary;

  beforeEach(() => {
    cy.loginByApi(users.teacher.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<Page<ClassSummary>>(
          "/classes?limit=100&active=true",
          created.accessToken,
        );
      })
      .then((classes) => {
        schoolClass = classes.docs.find(
          (item) => item.teacher?._id === session.user._id,
        )!;
        return cy.apiGet<Page<User>>(
          `/users?role=student&class=${schoolClass._id}&active=true&limit=100`,
          session.accessToken,
        );
      })
      .then((page) => {
        student = { ...page.docs[0], guardian_consent_at: null };

        cy.intercept(
          "GET",
          `**/users?*class=${schoolClass._id}*`,
          (request) => {
            request.continue((response) => {
              const list = response.body.data as Page<User>;
              list.docs = list.docs.map((item) =>
                item._id === student._id ? student : item,
              );
            });
          },
        );

        cy.visitWithSession(`/painel?turma=${schoolClass._id}`, session);
      });
  });

  it("mostra o selo só no cartão do aluno com termo pendente", () => {
    cy.contains("main li", student.name).should("contain", "Termo pendente");
    cy.get("main li")
      .filter(':contains("Termo pendente")')
      .should("have.length", 1);
  });

  it("registra o termo pela ficha", () => {
    cy.intercept("PATCH", `**/users/${student._id}/guardian-consent`, {
      body: envelope({
        ...student,
        guardian_consent_at: new Date().toISOString(),
      }),
    }).as("record");

    openSheet(student.name);
    cy.contains(`${dialog} button`, "Registrar termo").click();
    cy.contains(`${alertDialog} button`, "Termo recebido").click();

    cy.wait("@record");
    cy.get('[data-testid="consent-status"]').should(
      "have.text",
      "Termo registrado",
    );
  });

  it("revoga o consentimento e a ficha mostra a conta desativada", () => {
    const revokedAt = new Date().toISOString();

    cy.intercept("POST", `**/users/${student._id}/guardian-consent/revoke`, {
      body: envelope({
        ...student,
        active: false,
        guardian_consent_revoked_at: revokedAt,
      }),
    }).as("revoke");

    openSheet(student.name);
    cy.contains(`${dialog} button`, "Revogar consentimento").click();
    cy.contains(alertDialog, "A conta é desativada na hora").should(
      "be.visible",
    );
    cy.contains(`${alertDialog} button`, "Revogar e desativar").click();

    cy.wait("@revoke");
    cy.get(alertDialog).should("not.exist");
    cy.get('[data-testid="consent-status"]').should(
      "have.text",
      "Consentimento revogado",
    );
    cy.get(dialog).should("contain", "Inativo");
    cy.contains(`${dialog} button`, "Revogar consentimento").should(
      "not.exist",
    );
  });

  it("mostra a recusa do backend ao revogar", () => {
    cy.intercept("POST", `**/users/${student._id}/guardian-consent/revoke`, {
      statusCode: 403,
      body: {
        message: "Você só pode alterar o termo de alunos das suas turmas.",
        data: null,
        errors: [],
      },
    }).as("revoke");

    openSheet(student.name);
    cy.contains(`${dialog} button`, "Revogar consentimento").click();
    cy.contains(`${alertDialog} button`, "Revogar e desativar").click();

    cy.wait("@revoke");
    cy.contains(
      alertDialog,
      "Você só pode alterar o termo de alunos das suas turmas.",
    );
  });

  it("não mostra exportar nem eliminar dados para o professor", () => {
    openSheet(student.name);

    cy.contains(dialog, "Termo dos responsáveis").should("be.visible");
    cy.contains(dialog, "Dados do aluno (LGPD)").should("not.exist");
    cy.contains(`${dialog} button`, "Eliminar dados do aluno").should(
      "not.exist",
    );
  });

  it("esconde o ranking da turma para os alunos", () => {
    let hidden = false;

    cy.intercept("PATCH", `**/classes/${schoolClass._id}`, (request) => {
      hidden = true;
      request.reply({
        body: envelope({ ...schoolClass, ...request.body, teacher: null }),
      });
    }).as("toggle");
    // Depois do PATCH a lista de turmas é buscada de novo: devolve a turma
    // já com o ranking oculto, como o backend faria.
    cy.intercept("GET", "**/classes?*", (request) => {
      request.continue((response) => {
        if (hidden) {
          const page = response.body.data as Page<ClassSummary>;
          page.docs = page.docs.map((item) =>
            item._id === schoolClass._id
              ? { ...item, class_ranking_visible: false }
              : item,
          );
        }
      });
    });

    cy.get("#class-ranking-visible").should(
      "have.attr",
      "aria-checked",
      "true",
    );
    cy.get("#class-ranking-visible").click();

    cy.wait("@toggle")
      .its("request.body")
      .should("deep.eq", { class_ranking_visible: false });
    cy.get("#class-ranking-visible").should(
      "have.attr",
      "aria-checked",
      "false",
    );
    cy.contains("Oculto para os alunos").should("be.visible");
  });
});
