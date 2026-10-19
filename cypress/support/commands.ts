export type ApiSession = {
  accessToken: string;
  refreshToken: string;
  user: { _id: string; name: string; role: string };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- é assim que o Cypress tipa comandos novos
  namespace Cypress {
    interface Chainable {
      /** Preenche o formulário de login e clica em "Entrar". */
      fillLogin(email: string, password: string): Chainable<void>;
      /** Faz login direto na API, sem passar pela tela, e devolve a sessão. */
      loginByApi(email: string, password: string): Chainable<ApiSession>;
    }
  }
}

Cypress.Commands.add("fillLogin", (email, password) => {
  cy.get("#email").clear().type(email);
  cy.get("#password").clear().type(password, { log: false });
  cy.contains("button", "Entrar").click();
});

Cypress.Commands.add("loginByApi", (email, password) =>
  cy
    .request({
      method: "POST",
      url: `${Cypress.expose("apiUrl")}/auth/login`,
      body: { email, password },
      log: false,
    })
    .its("body.data"),
);
