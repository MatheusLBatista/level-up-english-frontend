// A API é simulada nestes testes: o fluxo real manda e-mail pelo Gmail (com
// limite de 5 pedidos por hora) e o código de redefinição só existe no e-mail.

const ok = { message: "ok", data: null, errors: [] };

describe("Esqueci minha senha", () => {
  beforeEach(() => {
    cy.intercept("POST", "**/auth/forgot-password", { body: ok }).as("forgot");
    cy.visit("/esqueci-senha");
  });

  it("valida o e-mail antes de chamar a API", () => {
    cy.get("#email").type("nao-e-email");
    cy.contains("button", "Enviar link").click();

    cy.contains("Informe um email válido").should("be.visible");
    cy.get("@forgot.all").should("have.length", 0);
  });

  it("envia o e-mail normalizado e confirma o envio", () => {
    cy.get("#email").type("  Ana.Ferreira@LevelUp.edu.br ");
    cy.contains("button", "Enviar link").click();

    cy.wait("@forgot")
      .its("request.body")
      .should("deep.eq", { email: "ana.ferreira@levelup.edu.br" });
    cy.contains("Se existir uma conta com").should("be.visible");
    cy.contains("strong", "ana.ferreira@levelup.edu.br").should("be.visible");
  });

  it("volta para o login", () => {
    cy.contains("a", "Voltar para o login").click();

    cy.location("pathname").should("eq", "/login");
  });
});

describe("Nova senha", () => {
  beforeEach(() => {
    cy.intercept("POST", "**/auth/reset-password", { body: ok }).as("reset");
  });

  it("avisa que o link é inválido quando falta o código", () => {
    cy.visit("/reset-password");

    cy.contains("Este link é inválido ou já expirou").should("be.visible");
    cy.contains("a", "Pedir um link novo").should(
      "have.attr",
      "href",
      "/esqueci-senha",
    );
  });

  it("confere se as senhas são iguais antes de chamar a API", () => {
    cy.visit("/reset-password?code=abc123");
    cy.get("#password").type("NovaSenha1");
    cy.get("#confirm").type("OutraSenha1");
    cy.contains("button", "Salvar nova senha").click();

    cy.contains("As senhas não conferem.").should("be.visible");
    cy.get("@reset.all").should("have.length", 0);
  });

  it("avisa que o link expirou quando a API recusa o código", () => {
    cy.intercept("POST", "**/auth/reset-password", {
      statusCode: 400,
      body: {
        message: "Código inválido ou expirado.",
        data: null,
        errors: [{ path: "code", message: "Código inválido ou expirado." }],
      },
    });

    cy.visit("/reset-password?code=vencido");
    cy.get("#password").type("NovaSenha1");
    cy.get("#confirm").type("NovaSenha1");
    cy.contains("button", "Salvar nova senha").click();

    cy.contains("Este link é inválido ou já expirou").should("be.visible");
  });

  it("salva a senha nova e leva para o login", () => {
    cy.visit("/reset-password?code=abc123");
    cy.get("#password").type("NovaSenha1");
    cy.get("#confirm").type("NovaSenha1");
    cy.contains("button", "Salvar nova senha").click();

    cy.wait("@reset")
      .its("request.body")
      .should("deep.eq", { code: "abc123", newPassword: "NovaSenha1" });
    cy.contains("Senha salva. Agora é só entrar.").should("be.visible");

    cy.contains("a", "Ir para o login").click();
    cy.location("pathname").should("eq", "/login");
  });

  it("mostra as boas-vindas no primeiro acesso", () => {
    cy.visit("/set-password?code=abc123");

    cy.contains("h1, [aria-level='1']", "Crie sua senha").should("be.visible");
    cy.contains("Bem-vindo ao LevelUp English!").should("be.visible");

    cy.get("#password").type("NovaSenha1");
    cy.get("#confirm").type("NovaSenha1");
    cy.contains("button", "Criar senha").click();

    cy.wait("@reset")
      .its("request.body")
      .should("deep.eq", { code: "abc123", newPassword: "NovaSenha1" });
  });
});
