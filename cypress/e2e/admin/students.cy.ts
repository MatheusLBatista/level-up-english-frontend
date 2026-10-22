import users from "../../fixtures/users.json";
import {
  envelope,
  type ClassSummary,
  type Page,
  type User,
} from "../../support/api-types";
import type { ApiSession } from "../../support/session";

const PAGE_SIZE = 12;

const dialog = '[role="dialog"]';
const alertDialog = '[role="alertdialog"]';

function studentRow(name: string) {
  return cy.contains("main ul > li", name);
}

// Editar, desativar, reativar e criar são simulados, para os alunos da
// demonstração não mudarem.
describe("Alunos do admin", () => {
  let session: ApiSession;
  let firstPage: Page<User>;
  let classes: ClassSummary[];

  beforeEach(() => {
    cy.loginByApi(users.admin.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<Page<User>>(
          `/users?role=student&limit=${PAGE_SIZE}&page=1&active=true`,
          created.accessToken,
        );
      })
      .then((page) => {
        firstPage = page;
        return cy.apiGet<Page<ClassSummary>>(
          "/classes?limit=100",
          session.accessToken,
        );
      })
      .then((page) => {
        classes = page.docs;
        cy.visitWithSession("/alunos", session);
      });
  });

  function className(id: string | null) {
    return classes.find((item) => item._id === id)?.name;
  }

  it("lista os alunos ativos com turma, nível e paginação", () => {
    cy.contains("h1", "Alunos").should("be.visible");
    cy.contains(`${firstPage.totalDocs} alunos`).should("be.visible");
    cy.get("main ul > li").should("have.length", firstPage.docs.length);

    firstPage.docs.forEach((student) => {
      studentRow(student.email)
        .should("contain", student.name)
        .and("contain", className(student.class) ?? "Sem turma")
        .and("contain", `Nv ${student.level}`);
    });

    cy.contains(`Página 1 de ${firstPage.totalPages}`).should("be.visible");
  });

  it("busca pelo nome e guarda a busca na URL", () => {
    const student = firstPage.docs[0];
    const term = student.name.split(" ")[0];

    cy.apiGet<Page<User>>(
      `/users?role=student&limit=${PAGE_SIZE}&active=true&name=${encodeURIComponent(term)}`,
      session.accessToken,
    ).then((found) => {
      cy.get('[aria-label="Buscar aluno"]').type(term);

      cy.location("search").should("contain", "busca=");
      // A busca espera o aluno parar de digitar: a contagem confirma que a
      // lista já é a do resultado.
      cy.contains(`${found.totalDocs} aluno`).should("be.visible");
      cy.get("main ul > li")
        .should("have.length", found.docs.length)
        .each((row) => {
          expect(row.text().toLowerCase()).to.contain(term.toLowerCase());
        });
      studentRow(student.name).should("be.visible");
    });
  });

  it("filtra pela turma", () => {
    const item = classes[0];

    // A turma também guarda alunos inativos; a lista mostra só os ativos.
    cy.apiGet<Page<User>>(
      `/users?role=student&class=${item._id}&active=true&limit=${PAGE_SIZE}`,
      session.accessToken,
    ).then((page) => {
      cy.selectOption('[aria-label="Filtrar por turma"]', item.name);

      cy.location("search").should("contain", `turma=${item._id}`);
      cy.get("main ul > li")
        .should("have.length", page.docs.length)
        .each((row) => {
          expect(row.text()).to.contain(item.name);
        });
    });
  });

  it("mostra os inativos e reativa um aluno", () => {
    cy.apiGet<Page<User>>(
      "/users?role=student&limit=12&active=false",
      session.accessToken,
    ).then((inactive) => {
      const student = inactive.docs[0];

      cy.intercept("PATCH", `**/users/${student._id}`, {
        body: envelope({ ...student, active: true }),
      }).as("reactivate");

      cy.contains("button", "Inativos").click();

      cy.location("search").should("contain", "status=inativos");
      studentRow(student.name).should("contain", "Inativo");
      cy.get(`[aria-label="Reativar ${student.name}"]`).click();

      cy.wait("@reactivate")
        .its("request.body")
        .should("deep.eq", { active: true });
    });
  });

  it("abre o perfil do aluno", () => {
    const student = firstPage.docs[0];

    cy.get(`[aria-label="Ver perfil de ${student.name}"]`).click();

    cy.get(dialog)
      .should("contain", student.name)
      .and("contain", `Nível ${student.level}`)
      .and("contain", "Histórico de XP");
  });

  it("tira o aluno da turma pela edição", () => {
    const student = firstPage.docs[0];

    cy.intercept("PATCH", `**/users/${student._id}`, (request) => {
      request.reply({ body: envelope({ ...student, ...request.body }) });
    }).as("update");

    cy.get(`[aria-label="Editar ${student.name}"]`).click();
    cy.contains(dialog, "Editar aluno").should("be.visible");
    cy.get("#edit-student-name").should("have.value", student.name);

    cy.selectOption("#edit-student-class", "Sem turma");
    cy.contains(`${dialog} button`, "Salvar alterações").click();

    cy.wait("@update")
      .its("request.body")
      .should("deep.eq", { name: student.name, class: null, active: true });
    cy.get(dialog).should("not.exist");
  });

  it("pede confirmação para desativar o aluno", () => {
    const student = firstPage.docs[0];

    cy.intercept("PATCH", `**/users/${student._id}`, {
      body: envelope({ ...student, active: false }),
    }).as("deactivate");

    cy.get(`[aria-label="Desativar ${student.name}"]`).click();

    cy.contains(alertDialog, "Desativar aluno?").should(
      "contain",
      `${student.name} não vai mais conseguir entrar`,
    );
    cy.contains(`${alertDialog} button`, "Desativar").click();

    cy.wait("@deactivate")
      .its("request.body")
      .should("deep.eq", { active: false });
  });

  it("cadastra aluno sem turma", () => {
    cy.intercept("POST", "**/auth/register-student", (request) => {
      request.reply({
        body: envelope({ _id: "new-student", ...request.body }),
      });
    }).as("register");

    cy.contains("button", "Criar aluno").click();
    cy.get("#student-class").should("contain", "Sem turma por enquanto");
    cy.get("#student-name").type("Carlos Teste");
    cy.get("#student-email").type("carlos.teste@levelup.edu.br");
    cy.contains(`${dialog} button`, "Criar aluno").click();

    // Sem turma, o campo `class` nem vai no corpo.
    cy.wait("@register").its("request.body").should("deep.eq", {
      name: "Carlos Teste",
      email: "carlos.teste@levelup.edu.br",
    });
    cy.contains(dialog, "Aluno criado").should("be.visible");
  });
});
