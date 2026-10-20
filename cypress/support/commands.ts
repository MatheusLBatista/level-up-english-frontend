import { SESSION_KEY, type ApiSession } from "./session";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- é assim que o Cypress tipa comandos novos
  namespace Cypress {
    interface Chainable {
      fillLogin(email: string, password: string): Chainable<void>;

      loginByApi(email: string, password: string): Chainable<ApiSession>;

      visitWithSession(path: string, session: ApiSession): Chainable<void>;

      apiGet<T>(path: string, token: string): Chainable<T>;
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

Cypress.Commands.add("visitWithSession", (path, session) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    },
  });
});

Cypress.Commands.add("apiGet", (path, token) =>
  cy
    .request({
      url: `${Cypress.expose("apiUrl")}${path}`,
      headers: { Authorization: `Bearer ${token}` },
      log: false,
    })
    .its("body.data"),
);
