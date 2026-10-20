import users from "../../fixtures/users.json";
import type { Ranking, User } from "../../support/api-types";
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
