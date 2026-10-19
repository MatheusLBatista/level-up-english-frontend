import users from "../fixtures/users.json";

const SESSION_KEY = "levelup-english:session";

const roles = [
  { label: "aluno", ...users.student },
  { label: "professor", ...users.teacher },
  { label: "admin", ...users.admin },
];

describe("Login", () => {
  beforeEach(() => {
    cy.intercept("POST", "**/auth/login").as("login");
    cy.visit("/login");
  });

  roles.forEach(({ label, email, home }) => {
    it(`leva o ${label} para a tela inicial dele`, () => {
      cy.fillLogin(email, users.password);

      cy.wait("@login").its("response.statusCode").should("eq", 200);
      cy.location("pathname").should("eq", home);
      cy.window()
        .its("localStorage")
        .invoke("getItem", SESSION_KEY)
        .should("exist");
    });
  });

  it("valida e-mail e senha antes de chamar a API", () => {
    cy.fillLogin("nao-e-email", "123");

    cy.contains("Informe um email válido").should("be.visible");
    cy.contains("A senha precisa ter ao menos 6 caracteres.").should(
      "be.visible",
    );
    cy.get("@login.all").should("have.length", 0);
  });

  it("mostra erro com credenciais inválidas", () => {
    // E-mail novo a cada execução: o backend bloqueia 10 erros seguidos
    // do mesmo IP + e-mail por 15 minutos.
    cy.fillLogin(`ninguem.${Date.now()}@levelup.edu.br`, "SenhaErrada1");

    cy.wait("@login").its("response.statusCode").should("eq", 401);
    cy.contains('[role="alert"]', "Credenciais inválidas").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });

  it("avisa quando a conta está desativada", () => {
    cy.fillLogin(users.disabled.email, users.password);

    cy.wait("@login").its("response.statusCode").should("eq", 401);
    cy.contains('[role="alert"]', "Conta bloqueada").should("be.visible");
    cy.location("pathname").should("eq", "/login");
  });
});
