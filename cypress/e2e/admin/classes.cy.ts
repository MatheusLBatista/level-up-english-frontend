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

function classRow(name: string) {
  return cy.contains("main ul > li", name);
}

// A Renata é a coordenadora no seed:demo. Criar, editar, desativar e reativar
// são simulados, para as turmas da demonstração não mudarem.
describe("Turmas do admin", () => {
  let session: ApiSession;
  let classes: ClassSummary[];
  let teachers: User[];

  beforeEach(() => {
    cy.loginByApi(users.admin.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<Page<ClassSummary>>(
          "/classes?limit=100&active=true",
          created.accessToken,
        );
      })
      .then((page) => {
        classes = page.docs;
        return cy.apiGet<Page<User>>(
          "/users?role=teacher&limit=100&active=true",
          session.accessToken,
        );
      })
      .then((page) => {
        teachers = page.docs;
        cy.visitWithSession("/turmas", session);
      });
  });

  it("lista as turmas ativas com professor, alunos e missões", () => {
    cy.contains("h1", "Turmas").should("be.visible");
    cy.get("main ul > li").should("have.length", classes.length);

    classes.forEach((item) => {
      classRow(item.name)
        .should("contain", item.teacher!.name)
        .and("contain", `${item.students.length} alunos`)
        .and("contain", `${item.missions.length} missões`);
    });
  });

  it("busca pelo nome da turma ou do professor", () => {
    const [first, second] = classes;

    cy.get('[aria-label="Buscar turma"]').type(first.teacher!.name);
    classRow(first.name).should("be.visible");
    classRow(second.name).should("not.exist");

    cy.get('[aria-label="Buscar turma"]').clear().type("turma-que-nao-existe");
    cy.contains('Nenhuma turma encontrada para "turma-que-nao-existe".').should(
      "be.visible",
    );
  });

  it("filtra por status e guarda o filtro na URL", () => {
    cy.contains("button", "Inativas").click();
    cy.location("search").should("contain", "status=inativas");
    cy.contains("Nenhuma turma inativa.").should("be.visible");

    cy.contains("button", "Todas").click();
    cy.location("search").should("contain", "status=todas");
    cy.get("main ul > li").should("have.length", classes.length);
  });

  describe("Nova turma", () => {
    beforeEach(() => {
      cy.contains("button", "Nova turma").click();
      cy.contains(dialog, "Nova turma").should("be.visible");
    });

    it("exige nome e professor antes de chamar a API", () => {
      cy.intercept("POST", "**/classes").as("create");

      cy.contains(`${dialog} button`, "Criar turma").click();

      cy.contains("Dê um nome à turma.").should("be.visible");
      cy.contains("Escolha o professor da turma.").should("be.visible");
      cy.get("@create.all").should("have.length", 0);
    });

    it("mostra no campo o erro de nome repetido", () => {
      // Chamada real: o nome já existe, então o backend recusa sem criar nada.
      cy.get("#class-name").type(classes[0].name);
      cy.selectOption("#class-teacher", teachers[0].name);
      cy.contains(`${dialog} button`, "Criar turma").click();

      cy.get("#class-name").should("have.attr", "aria-invalid", "true");
      cy.contains("Já existe uma turma com este nome.").should("be.visible");
    });

    it("cria a turma com o professor escolhido", () => {
      const teacher = teachers[0];

      cy.intercept("POST", "**/classes", (request) => {
        request.reply({
          body: envelope({ _id: "new-class", ...request.body }),
        });
      }).as("create");

      cy.get("#class-name").type("4º Ano C — Noite");
      cy.selectOption("#class-teacher", teacher.name);
      cy.contains(`${dialog} button`, "Criar turma").click();

      cy.wait("@create")
        .its("request.body")
        .should("deep.eq", { name: "4º Ano C — Noite", teacher: teacher._id });
      cy.get(dialog).should("not.exist");
    });
  });

  it("edita o nome e o professor da turma", () => {
    const item = classes[0];
    const other = teachers.find(
      (teacher) => teacher._id !== item.teacher!._id,
    )!;

    cy.intercept("PATCH", `**/classes/${item._id}`, (request) => {
      request.reply({ body: envelope({ ...item, ...request.body }) });
    }).as("update");

    cy.get(`[aria-label="Editar ${item.name}"]`).click();
    cy.contains(dialog, "Editar turma").should("be.visible");
    cy.get("#class-name").should("have.value", item.name);
    cy.get("#class-teacher").should("contain", item.teacher!.name);

    cy.get("#class-name").clear().type(`${item.name} (2027)`);
    cy.selectOption("#class-teacher", other.name);
    cy.contains(`${dialog} button`, "Salvar alterações").click();

    cy.wait("@update")
      .its("request.body")
      .should("deep.eq", {
        name: `${item.name} (2027)`,
        teacher: other._id,
        active: true,
      });
    cy.get(dialog).should("not.exist");
  });

  it("pede confirmação para desativar a turma", () => {
    const item = classes[0];

    cy.intercept("PATCH", `**/classes/${item._id}`, {
      body: envelope({ ...item, active: false }),
    }).as("deactivate");

    cy.get(`[aria-label="Desativar ${item.name}"]`).click();

    cy.contains(alertDialog, "Desativar turma?")
      .should("contain", item.name)
      .and("contain", item.teacher!.name);
    cy.contains(`${alertDialog} button`, "Desativar").click();

    cy.wait("@deactivate")
      .its("request.body")
      .should("deep.eq", { active: false });
    cy.get(alertDialog).should("not.exist");
  });

  it("reativa uma turma inativa", () => {
    // O seed não tem turma inativa: a lista de inativas vem simulada.
    const item = { ...classes[0], active: false };

    cy.intercept("GET", "**/classes?*active=false*", {
      body: envelope({ docs: [item], totalDocs: 1, totalPages: 1 }),
    });
    cy.intercept("PATCH", `**/classes/${item._id}`, {
      body: envelope({ ...item, active: true }),
    }).as("reactivate");

    cy.contains("button", "Inativas").click();
    classRow(item.name).should("contain", "Inativa");
    cy.get(`[aria-label="Reativar ${item.name}"]`).click();

    cy.wait("@reactivate")
      .its("request.body")
      .should("deep.eq", { active: true });
  });
});
