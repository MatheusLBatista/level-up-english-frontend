import users from "../../fixtures/users.json";
import {
  envelope,
  fullDate,
  type Page,
  type User,
} from "../../support/api-types";
import type { ApiSession } from "../../support/session";

const dialog = '[role="dialog"]';
const alertDialog = '[role="alertdialog"]';
const consentMessage =
  "Confirme o recebimento do termo de consentimento assinado pelos responsáveis.";

function studentRow(text: string) {
  return cy.contains("main ul > li", text);
}

/** Abre a ficha do aluno pela lista de /alunos. */
function openSheet(student: User) {
  studentRow(student.email)
    .find(`[aria-label="Ver perfil de ${student.name}"]`)
    .click();
  cy.get(dialog).should("contain", student.name);
}

// No seed:demo todo aluno nasce com o termo registrado. Leituras (lista,
// ficha, exportação) vão no backend real com o Arthur; criar, reativar e
// eliminar são simulados — a eliminação não tem volta e estragaria a demo.
describe("LGPD no admin", () => {
  let session: ApiSession;
  let arthur: User;

  beforeEach(() => {
    cy.loginByApi(users.admin.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<Page<User>>(
          `/users?role=student&email=${encodeURIComponent(users.newStudent.email)}`,
          created.accessToken,
        );
      })
      .then((page) => {
        arthur = page.docs.find(
          (student) => student.email === users.newStudent.email,
        )!;
      });
  });

  describe("Criação com o termo", () => {
    beforeEach(() => {
      cy.visitWithSession("/alunos", session);
      cy.contains("button", "Criar aluno").click();
    });

    it("só libera a criação depois de marcar o termo", () => {
      cy.intercept("POST", "**/auth/register-student").as("register");

      cy.get("#student-name").type("Carlos Teste");
      cy.get("#student-email").type("carlos.teste@levelup.edu.br");

      cy.get("#student-guardian-consent").should(
        "have.attr",
        "aria-checked",
        "false",
      );
      cy.contains(`${dialog} button`, "Criar aluno").should("be.disabled");

      cy.get("#student-guardian-consent").click();
      cy.contains(`${dialog} button`, "Criar aluno").should("be.enabled");
      cy.get("#student-guardian-consent").click();
      cy.contains(`${dialog} button`, "Criar aluno").should("be.disabled");

      cy.get("@register.all").should("have.length", 0);
    });

    it("liga o checkbox ao modelo do termo, em nova aba", () => {
      cy.contains(`${dialog} a`, "Imprimir termo")
        .should("have.attr", "href", "/termo-responsaveis")
        .and("have.attr", "target", "_blank");
    });

    it("mostra o erro do backend quando a confirmação é recusada", () => {
      cy.intercept("POST", "**/auth/register-student", {
        statusCode: 400,
        body: {
          message: "Validation error",
          data: null,
          errors: [{ path: "guardian_consent", message: consentMessage }],
        },
      }).as("register");

      cy.get("#student-name").type("Carlos Teste");
      cy.get("#student-email").type("carlos.teste@levelup.edu.br");
      cy.get("#student-guardian-consent").click();
      cy.contains(`${dialog} button`, "Criar aluno").click();

      cy.wait("@register");
      cy.contains(dialog, consentMessage).should("be.visible");
    });
  });

  describe("Termo na ficha e reativação", () => {
    it("mostra na ficha a data em que o termo foi registrado", () => {
      cy.visitWithSession(
        `/alunos?busca=${encodeURIComponent(arthur.name)}`,
        session,
      );
      openSheet(arthur);

      cy.get('[data-testid="consent-status"]').should(
        "have.text",
        "Termo registrado",
      );
      cy.get('[data-testid="consent-recorded-at"]').should(
        "have.text",
        fullDate(arthur.guardian_consent_at!),
      );
      cy.get('[data-testid="consent-revoked-at"]').should("not.exist");
      cy.contains(`${dialog} button`, "Registrar termo").should("not.exist");
    });

    it("exige um termo novo para reativar aluno com consentimento revogado", () => {
      const revokedAt = "2026-11-01T13:00:00.000Z";
      const revoked: User = {
        ...arthur,
        active: false,
        guardian_consent_revoked_at: revokedAt,
      };

      // A lista de inativos vem com o Arthur revogado.
      cy.intercept("GET", "**/users?*active=false*", {
        body: envelope({
          docs: [revoked],
          totalDocs: 1,
          limit: 12,
          page: 1,
          totalPages: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        }),
      });
      cy.intercept("PATCH", `**/users/${arthur._id}`, {
        body: envelope({
          ...arthur,
          guardian_consent_at: new Date().toISOString(),
        }),
      }).as("reactivate");

      cy.visitWithSession("/alunos?status=inativos", session);
      studentRow(arthur.email).should("contain", "Consentimento revogado");

      openSheet(revoked);
      cy.get('[data-testid="consent-revoked-at"]').should(
        "have.text",
        fullDate(revokedAt),
      );
      cy.get("body").type("{esc}");
      cy.get(dialog).should("not.exist");

      cy.get(`[aria-label="Reativar ${arthur.name}"]`).click();
      cy.contains(`${alertDialog} button`, "Reativar com termo novo").should(
        "be.disabled",
      );
      cy.get("#reactivate-guardian-consent").click();
      cy.contains(`${alertDialog} button`, "Reativar com termo novo").click();

      cy.wait("@reactivate")
        .its("request.body")
        .should("deep.eq", { active: true, guardian_consent: true });
      cy.get(alertDialog).should("not.exist");
    });
  });

  describe("Dados do aluno", () => {
    beforeEach(() => {
      cy.visitWithSession(
        `/alunos?busca=${encodeURIComponent(arthur.name)}`,
        session,
      );
      openSheet(arthur);
    });

    it("exporta os dados do aluno em JSON", () => {
      cy.intercept("GET", `**/users/${arthur._id}/data-export`).as("export");

      cy.contains(`${dialog} button`, "Exportar dados (JSON)").click();

      cy.wait("@export").then(({ response }) => {
        expect(response?.statusCode).to.eq(200);
        const data = response?.body.data;
        const day = String(data.exported_at).slice(0, 10);

        cy.readFile(
          `${Cypress.config("downloadsFolder")}/dados-aluno-${arthur._id}-${day}.json`,
        ).then((file) => {
          expect(file.student.email).to.eq(arthur.email);
          expect(file).to.have.all.keys(
            "exported_at",
            "student",
            "mission_progress",
            "attitude_logs",
            "xp_adjustments",
            "notifications",
            "rankings",
          );
        });
      });
      cy.contains(dialog, "Arquivo baixado").should("be.visible");
    });

    it("só elimina depois de digitar o nome do aluno", () => {
      const erasedAt = new Date().toISOString();

      cy.intercept("POST", `**/users/${arthur._id}/erasure`, {
        body: envelope({
          ...arthur,
          name: "Aluno removido",
          email: `removido-${arthur._id}@anonimizado.invalid`,
          active: false,
          anonymized_at: erasedAt,
        }),
      }).as("erase");

      cy.contains(`${dialog} button`, "Eliminar dados do aluno").click();
      cy.contains(alertDialog, "não pode ser desfeita").should("be.visible");

      cy.contains(`${alertDialog} button`, "Eliminar definitivamente").should(
        "be.disabled",
      );
      cy.get("#erase-confirm-name").type(arthur.name.split(" ")[0]);
      cy.contains(`${alertDialog} button`, "Eliminar definitivamente").should(
        "be.disabled",
      );

      cy.get("#erase-confirm-name").clear().type(arthur.name.toUpperCase());
      cy.contains(`${alertDialog} button`, "Eliminar definitivamente")
        .should("be.enabled")
        .click();

      cy.wait("@erase")
        .its("request.body")
        .should("deep.eq", { confirm: true });
      cy.get(alertDialog).should("not.exist");
      cy.get('[data-testid="consent-status"]').should(
        "have.text",
        "Dados eliminados",
      );
      cy.get(dialog).should("contain", "Aluno removido");
      cy.contains(`${dialog} button`, "Eliminar dados do aluno").should(
        "not.exist",
      );
    });

    it("mostra o erro quando os dados já foram eliminados", () => {
      cy.intercept("POST", `**/users/${arthur._id}/erasure`, {
        statusCode: 409,
        body: {
          message: "Os dados deste aluno já foram eliminados.",
          data: null,
          errors: [],
        },
      }).as("erase");

      cy.contains(`${dialog} button`, "Eliminar dados do aluno").click();
      cy.get("#erase-confirm-name").type(arthur.name);
      cy.contains(`${alertDialog} button`, "Eliminar definitivamente").click();

      cy.wait("@erase");
      cy.contains(alertDialog, "Os dados deste aluno já foram eliminados.");
    });
  });
});
