declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- é assim que o Cypress tipa comandos novos
  namespace Cypress {
    interface Chainable {
      /** Preenche o formulário de login e clica em "Entrar". */
      fillLogin(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("fillLogin", (email, password) => {
  cy.get("#email").clear().type(email);
  cy.get("#password").clear().type(password, { log: false });
  cy.contains("button", "Entrar").click();
});

export {};
