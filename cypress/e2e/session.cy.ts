import { SESSION_KEY, type ApiSession } from "../support/session";
import users from "../fixtures/users.json";

/**
 * Entra como aluno pela API e abre a página com a sessão no navegador. As
 * `changes` estragam tokens de propósito, para simular uma sessão vencida.
 */
function visitAsStudent(path: string, changes: Partial<ApiSession> = {}) {
  cy.loginByApi(users.student.email, users.password).then((session) => {
    cy.visitWithSession(path, { ...session, ...changes });
  });
}

function storedSession() {
  return cy.window().its("localStorage").invoke("getItem", SESSION_KEY);
}

describe("Sessão", () => {
  it("manda para o login quem abre uma rota protegida sem sessão", () => {
    cy.visit("/dashboard");

    cy.location("pathname").should("eq", "/login");
  });

  it("mantém a sessão ao recarregar e tira o usuário logado do /login", () => {
    cy.visit("/login");
    cy.fillLogin(users.student.email, users.password);
    cy.location("pathname").should("eq", "/dashboard");

    cy.reload();
    cy.location("pathname").should("eq", "/dashboard");

    cy.visit("/login");
    cy.location("pathname").should("eq", "/dashboard");
  });

  it("sai da conta e apaga a sessão do navegador", () => {
    cy.visit("/login");
    cy.fillLogin(users.student.email, users.password);
    cy.location("pathname").should("eq", "/dashboard");

    cy.contains("button", "Sair").click();

    cy.location("pathname").should("eq", "/login");
    storedSession().should("be.null");
  });
});

describe("Sessão vencida durante o uso", () => {
  beforeEach(() => {
    cy.intercept("POST", "**/auth/refresh").as("refresh");
  });

  it("renova o token sem o usuário perceber", () => {
    visitAsStudent("/dashboard", { accessToken: "token-vencido" });

    cy.wait("@refresh").its("response.statusCode").should("eq", 200);
    cy.location("pathname").should("eq", "/dashboard");
    storedSession()
      .then((raw) => JSON.parse(String(raw)).accessToken)
      .should("not.eq", "token-vencido");

    // Várias telas pedem dados ao mesmo tempo e todas recebem 401, mas o
    // front faz uma renovação só (refreshOnce em src/lib/api.ts).
    cy.get("@refresh.all").should("have.length", 1);
  });

  it("volta para o login quando nem a renovação funciona", () => {
    visitAsStudent("/dashboard", {
      accessToken: "token-vencido",
      refreshToken: "refresh-invalido",
    });

    cy.wait("@refresh").its("response.statusCode").should("eq", 401);
    cy.location("pathname").should("eq", "/login");
    cy.contains('[role="status"]', "Sua sessão expirou").should("be.visible");
    storedSession().should("be.null");
  });

  it("tira o usuário quando a conta é desativada durante o uso", () => {
    // Desativar a conta de verdade mexeria no banco; aqui a API responde
    // como responderia para uma conta desativada.
    cy.intercept("GET", "**/users/*", {
      statusCode: 403,
      body: {
        message: "Conta bloqueada. Entre em contato com o suporte.",
        data: null,
        errors: [],
      },
    });

    visitAsStudent("/dashboard");

    cy.location("pathname").should("eq", "/login");
    cy.contains('[role="status"]', "Sua conta foi desativada").should(
      "be.visible",
    );
    storedSession().should("be.null");
  });
});
