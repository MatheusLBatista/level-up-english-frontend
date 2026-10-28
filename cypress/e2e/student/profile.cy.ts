import users from "../../fixtures/users.json";
import { envelope, type Ranking, type User } from "../../support/api-types";
import { SESSION_KEY, type ApiSession } from "../../support/session";

const xpFormatter = new Intl.NumberFormat("pt-BR");

describe("Perfil do aluno", () => {
  let session: ApiSession;
  let user: User;

  beforeEach(() => {
    cy.loginByApi(users.student.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<User>(
          `/users/${created.user._id}`,
          created.accessToken,
        );
      })
      .then((found) => {
        user = found;
        cy.visitWithSession("/perfil", session);
      });
  });

  it("mostra os dados, a turma e as conquistas", () => {
    cy.apiGet<Ranking>("/rankings/me", session.accessToken).then((ranking) => {
      const position =
        ranking.entries.findIndex((entry) => entry.user._id === user._id) + 1;

      cy.contains("h2", user.name).should("be.visible");
      cy.contains(user.email).should("be.visible");
      cy.contains(`Nível ${user.level}`).should("be.visible");
      cy.contains(`${xpFormatter.format(user.xp)} XP`).should("be.visible");

      cy.contains(ranking.class!.name).should("be.visible");
      cy.contains("p", "Posição na turma")
        .parent()
        .should("contain", `${position}º`);
    });

    cy.contains("p", "Missões concluídas")
      .parent()
      .should(
        "contain",
        user.mission_progress.filter((entry) => entry.done).length,
      );
    cy.contains("li", "Primeiro passo").should("contain", "(desbloqueada)");
  });

  describe("Editar perfil", () => {
    // O nome salvo é simulado, para não mudar os dados da demonstração.
    beforeEach(() => {
      cy.intercept("PATCH", `**/users/${user._id}`, (request) => {
        request.reply({
          body: {
            message: "ok",
            errors: [],
            data: { ...user, name: request.body.name },
          },
        });
      }).as("update");

      cy.contains("button", "Editar perfil").click();
    });

    it("não aceita nome curto", () => {
      cy.get("#name").clear().type("Al");
      cy.contains('[role="dialog"] button', "Salvar").click();

      cy.contains("O nome precisa ter ao menos 3 caracteres.").should(
        "be.visible",
      );
      cy.get("@update.all").should("have.length", 0);
    });

    it("salva o nome e atualiza a tela e a sessão", () => {
      const name = "Ana Luiza Ferreira Souza";

      cy.get("#name").clear().type(name);
      cy.contains('[role="dialog"] button', "Salvar").click();

      cy.wait("@update").its("request.body").should("deep.eq", { name });
      cy.get('[role="dialog"]').should("not.exist");
      cy.contains("h2", name).should("be.visible");
      cy.window()
        .its("localStorage")
        .invoke("getItem", SESSION_KEY)
        .then((raw) => JSON.parse(String(raw)).user.name)
        .should("eq", name);
    });
  });

  describe("Foto de perfil", () => {
    const dialog = '[role="dialog"]';
    const avatarUrl = "/uploads/avatars/foto-teste.webp";

    // O envio e a remoção são simulados, para não mudar os dados da demonstração.
    beforeEach(() => {
      cy.intercept("GET", "**/uploads/avatars/*", { fixture: "avatar.png" });
      cy.intercept("PATCH", `**/users/${user._id}/avatar`, {
        body: envelope({ ...user, email: undefined, avatar_url: avatarUrl }),
      }).as("upload");

      cy.get('[aria-label="Trocar foto de perfil"]').click();
      cy.contains(dialog, "Foto de perfil").should("be.visible");
    });

    function pickFile(file: Cypress.FileReferenceObject | string) {
      cy.get(`${dialog} input[type="file"]`).selectFile(file, { force: true });
    }

    it("recusa arquivo que não é imagem ou passa de 2 MB", () => {
      pickFile({
        contents: Cypress.Buffer.from("anotações"),
        fileName: "notas.txt",
        mimeType: "text/plain",
      });
      cy.contains(dialog, "Escolha uma imagem JPEG, PNG ou WebP.").should(
        "be.visible",
      );

      pickFile({
        contents: Cypress.Buffer.alloc(2 * 1024 * 1024 + 1),
        fileName: "grande.png",
        mimeType: "image/png",
      });
      cy.contains(dialog, "A foto deve ter no máximo 2 MB.").should(
        "be.visible",
      );

      cy.contains(`${dialog} button`, "Salvar foto").should("be.disabled");
      cy.get("@upload.all").should("have.length", 0);
    });

    it("mostra a prévia, envia a foto e atualiza a tela e a sessão", () => {
      pickFile("cypress/fixtures/avatar.png");
      cy.get(`${dialog} img`)
        .should("have.attr", "src")
        .and("match", /^blob:/);

      cy.contains(`${dialog} button`, "Salvar foto").click();

      cy.wait("@upload")
        .its("request.headers.content-type")
        .should("match", /^multipart\/form-data/);
      cy.get(dialog).should("not.exist");

      cy.get("header img").should("have.attr", "src").and("contain", avatarUrl);
      cy.get('[aria-label="Trocar foto de perfil"] img').should("be.visible");
      // A resposta não traz o e-mail, e ele continua na tela.
      cy.contains(user.email).should("be.visible");
      cy.window()
        .its("localStorage")
        .invoke("getItem", SESSION_KEY)
        .then((raw) => JSON.parse(String(raw)).user)
        .should((stored) => {
          expect(stored.avatar_url).to.eq(avatarUrl);
          expect(stored.email).to.eq(user.email);
        });
    });

    it("mostra o erro do servidor sem fechar o diálogo", () => {
      cy.intercept("PATCH", `**/users/${user._id}/avatar`, {
        statusCode: 400,
        body: {
          message:
            "O arquivo enviado não é uma imagem válida ou é grande demais.",
          data: null,
          errors: [],
        },
      }).as("upload");

      pickFile("cypress/fixtures/avatar.png");
      cy.contains(`${dialog} button`, "Salvar foto").click();

      cy.wait("@upload");
      cy.contains(
        `${dialog} [role="alert"]`,
        "O arquivo enviado não é uma imagem válida ou é grande demais.",
      ).should("be.visible");
    });

    it("remove a foto atual", () => {
      cy.intercept("GET", `**/users/${user._id}`, {
        body: envelope({ ...user, avatar_url: avatarUrl }),
      });
      cy.intercept("DELETE", `**/users/${user._id}/avatar`, {
        body: envelope({ ...user, avatar_url: null }),
      }).as("remove");
      cy.reload();

      cy.get('[aria-label="Trocar foto de perfil"] img').should("be.visible");
      cy.get('[aria-label="Trocar foto de perfil"]').click();
      cy.contains(`${dialog} button`, "Remover foto").click();

      cy.wait("@remove");
      cy.get(dialog).should("not.exist");
      cy.get('[aria-label="Trocar foto de perfil"] img').should("not.exist");
    });
  });

  describe("Alterar senha", () => {
    beforeEach(() => {
      cy.intercept("PATCH", "**/auth/change-password").as("change");
      cy.contains("button", "Alterar senha").click();
    });

    function fillPassword(current: string, next: string, confirm = next) {
      cy.get("#currentPassword").type(current, { log: false });
      cy.get("#newPassword").type(next, { log: false });
      cy.get("#confirmPassword").type(confirm, { log: false });
      cy.contains('[role="dialog"] button', "Alterar senha").click();
    }

    it("valida as senhas antes de chamar a API", () => {
      fillPassword(users.password, users.password);
      cy.contains("A nova senha precisa ser diferente da atual.").should(
        "be.visible",
      );

      cy.get("#newPassword").clear().type("NovaSenha1");
      cy.get("#confirmPassword").clear().type("OutraSenha1");
      cy.contains('[role="dialog"] button', "Alterar senha").click();
      cy.contains("As senhas não conferem.").should("be.visible");

      cy.get("@change.all").should("have.length", 0);
    });

    it("avisa que a senha atual está errada sem deslogar", () => {
      // Chamada real: com a senha atual errada o backend não muda nada.
      fillPassword("SenhaErrada1", "NovaSenha1");

      cy.wait("@change").its("response.statusCode").should("eq", 400);
      cy.contains('[role="alert"]', "Senha atual incorreta.").should(
        "be.visible",
      );
      cy.location("pathname").should("eq", "/perfil");
      cy.window()
        .its("localStorage")
        .invoke("getItem", SESSION_KEY)
        .should("exist");
    });

    it("confirma quando a senha é trocada", () => {
      cy.intercept("PATCH", "**/auth/change-password", {
        body: { message: "ok", data: null, errors: [] },
      }).as("change");

      fillPassword(users.password, "NovaSenha1");

      cy.wait("@change").its("request.body").should("deep.eq", {
        currentPassword: users.password,
        newPassword: "NovaSenha1",
      });
      cy.contains("Senha alterada com sucesso.").should("be.visible");
      cy.contains('[role="dialog"] button', "Fechar").should("be.visible");
    });
  });
});
