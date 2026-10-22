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

function teacherRow(name: string) {
  return cy.contains("main ul > li", name);
}

/** Caixa de seleção de uma turma no formulário de professor. */
function classCheckbox(item: ClassSummary) {
  return cy.get(`[id="class-${item._id}"]`);
}

// Cadastrar, editar e desativar são simulados, para a equipe da demonstração
// não mudar.
describe("Professores do admin", () => {
  let session: ApiSession;
  let teachers: User[];
  let classes: ClassSummary[];

  beforeEach(() => {
    cy.loginByApi(users.admin.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<Page<User>>(
          "/users?role=teacher&limit=100&active=true",
          created.accessToken,
        );
      })
      .then((page) => {
        teachers = page.docs;
        return cy.apiGet<Page<ClassSummary>>(
          "/classes?limit=100&active=true",
          session.accessToken,
        );
      })
      .then((page) => {
        classes = page.docs;
        cy.visitWithSession("/professores", session);
      });
  });

  function classesOf(teacher: User) {
    return classes.filter((item) => item.teacher?._id === teacher._id);
  }

  it("lista os professores com e-mail e turmas", () => {
    cy.contains("h1", "Professores").should("be.visible");

    teachers.forEach((teacher) => {
      teacherRow(teacher.email).should("contain", teacher.name);

      classesOf(teacher).forEach((item) => {
        teacherRow(teacher.email).should("contain", item.name);
      });
    });
  });

  it("busca pelo e-mail", () => {
    const [first, second] = teachers;

    cy.get('[aria-label="Buscar professor"]').type(first.email.split("@")[0]);

    teacherRow(first.name).should("be.visible");
    teacherRow(second.name).should("not.exist");
  });

  it("mostra a lista de desativados", () => {
    cy.contains("button", "Desativados").click();

    cy.location("search").should("contain", "status=desativados");
    cy.contains("Nenhum professor desativado.").should("be.visible");
  });

  describe("Novo professor", () => {
    beforeEach(() => {
      cy.contains("button", "Novo professor").click();
      cy.contains(dialog, "Novo professor").should("be.visible");
    });

    it("valida nome e e-mail antes de chamar a API", () => {
      cy.intercept("POST", "**/auth/register-teacher").as("register");

      cy.get("#teacher-name").type("A");
      cy.get("#teacher-email").type("nao-e-email");
      cy.contains(`${dialog} button`, "Cadastrar professor").click();

      cy.contains("Use pelo menos 2 letras no nome.").should("be.visible");
      cy.contains("Digite um e-mail válido.").should("be.visible");
      cy.get("@register.all").should("have.length", 0);
    });

    it("cadastra o professor já responsável por uma turma", () => {
      const item = classes[0];

      cy.intercept("POST", "**/auth/register-teacher", (request) => {
        request.reply({
          body: envelope({ _id: "new-teacher", ...request.body }),
        });
      }).as("register");

      cy.get("#teacher-name").type("Paula Nogueira");
      cy.get("#teacher-email").type("paula.nogueira@levelup.edu.br");
      // A turma já tem professor: o formulário avisa quem ela deixa.
      cy.contains("label", item.name).should(
        "contain",
        `hoje: ${item.teacher!.name}`,
      );
      classCheckbox(item).click();
      cy.contains("label", item.name).should(
        "contain",
        `sai de ${item.teacher!.name}`,
      );
      cy.contains(`${dialog} button`, "Cadastrar professor").click();

      cy.wait("@register")
        .its("request.body")
        .should("deep.eq", {
          name: "Paula Nogueira",
          email: "paula.nogueira@levelup.edu.br",
          classes: [item._id],
        });
      cy.contains(dialog, "Professor cadastrado").should(
        "contain",
        "paula.nogueira@levelup.edu.br",
      );
    });
  });

  it("renomeia o professor e troca as turmas dele", () => {
    const teacher = teachers.find((item) => classesOf(item).length > 0)!;
    const [current] = classesOf(teacher);
    const other = classes.find((item) => item.teacher?._id !== teacher._id)!;
    const classUpdates: { id: string; body: object }[] = [];

    cy.intercept("PATCH", `**/users/${teacher._id}`, (request) => {
      request.reply({ body: envelope({ ...teacher, ...request.body }) });
    }).as("rename");
    cy.intercept("PATCH", "**/classes/*", (request) => {
      classUpdates.push({
        id: request.url.split("/").pop()!,
        body: request.body,
      });
      request.reply({ body: envelope({ _id: "class" }) });
    });

    // Espera as turmas carregarem: o chip aparece na linha do professor.
    teacherRow(teacher.email).should("contain", current.name);
    cy.get(`[aria-label="Editar ${teacher.name}"]`).click();
    cy.contains(dialog, "Editar professor").should("be.visible");
    classCheckbox(current).should("have.attr", "data-state", "checked");

    cy.get("#edit-teacher-name").clear().type(`${teacher.name} Souza`);
    classCheckbox(current).click();
    classCheckbox(other).click();
    cy.contains(`${dialog} button`, "Salvar alterações").click();

    cy.wait("@rename")
      .its("request.body")
      .should("deep.eq", { name: `${teacher.name} Souza` });
    // A turma marcada ganha o professor; a desmarcada fica sem.
    cy.wrap(classUpdates).should("have.deep.members", [
      { id: other._id, body: { teacher: teacher._id } },
      { id: current._id, body: { teacher: null } },
    ]);
    cy.get(dialog).should("not.exist");
  });

  it("abre a edição com as turmas do professor mesmo se elas demorarem a carregar", () => {
    const teacher = teachers.find((item) => classesOf(item).length > 0)!;

    // Turmas mais lentas que os professores, como na API hospedada fria.
    cy.intercept("GET", "**/classes?*", (request) => {
      request.on("response", (response) => {
        response.setDelay(1500);
      });
    });
    cy.reload();

    cy.get(`[aria-label="Editar ${teacher.name}"]`).click();

    classesOf(teacher).forEach((item) => {
      classCheckbox(item).should("have.attr", "data-state", "checked");
    });
  });

  it("avisa quais turmas ficam sem professor ao desativar", () => {
    const teacher = teachers.find((item) => classesOf(item).length > 0)!;

    cy.intercept("PATCH", `**/users/${teacher._id}`, {
      body: envelope({ ...teacher, active: false }),
    }).as("deactivate");

    cy.get(`[aria-label="Desativar ${teacher.name}"]`).click();

    cy.contains(alertDialog, "Desativar professor?").within(() => {
      cy.contains(/ficam? sem professor ativo/).should("be.visible");
      classesOf(teacher).forEach((item) => {
        cy.contains(item.name).should("be.visible");
      });
    });
    cy.contains(`${alertDialog} button`, "Desativar").click();

    cy.wait("@deactivate")
      .its("request.body")
      .should("deep.eq", { active: false });
  });
});
