import users from "../../fixtures/users.json";
import { SESSION_KEY, type ApiSession } from "../../support/session";

/** Mesma chave do ThemeProvider (src/providers/theme-provider.tsx). */
const THEME_KEY = "levelup-english:theme";
const toggle = '[aria-label="Alternar entre tema claro e escuro"]';

type Theme = "light" | "dark";

/**
 * O next-themes descobre o tema do aparelho pelo `prefers-color-scheme`. O
 * matchMedia é trocado antes de qualquer script da página rodar.
 */
function emulateSystemTheme(win: Cypress.AUTWindow, system: Theme) {
  const original = win.matchMedia.bind(win);

  cy.stub(win, "matchMedia").callsFake((query: string) =>
    query === "(prefers-color-scheme: dark)"
      ? {
          matches: system === "dark",
          media: query,
          onchange: null,
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent: () => false,
        }
      : original(query),
  );
}

function visitWithTheme(
  path: string,
  {
    system,
    saved,
    session,
  }: { system: Theme; saved?: Theme; session?: ApiSession },
) {
  cy.visit(path, {
    onBeforeLoad(win) {
      emulateSystemTheme(win, system);

      if (saved) {
        win.localStorage.setItem(THEME_KEY, saved);
      }

      if (session) {
        win.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    },
  });
}

function expectTheme(theme: Theme) {
  cy.get("html").should(
    theme === "dark" ? "have.class" : "not.have.class",
    "dark",
  );
  cy.get("html").should("have.css", "color-scheme", theme);
}

describe("Tema claro e escuro", () => {
  it("segue o tema escuro do aparelho na primeira visita", () => {
    visitWithTheme("/login", { system: "dark" });

    expectTheme("dark");
  });

  it("segue o tema claro do aparelho na primeira visita", () => {
    visitWithTheme("/login", { system: "light" });

    expectTheme("light");
  });

  it("alterna pelo botão do login e guarda a escolha", () => {
    visitWithTheme("/login", { system: "dark" });
    expectTheme("dark");

    cy.get(toggle).click();
    expectTheme("light");
    cy.window()
      .its("localStorage")
      .invoke("getItem", THEME_KEY)
      .should("eq", "light");

    cy.get(toggle).click();
    expectTheme("dark");
    cy.window()
      .its("localStorage")
      .invoke("getItem", THEME_KEY)
      .should("eq", "dark");
  });

  it("a escolha salva vale mais que o tema do aparelho", () => {
    visitWithTheme("/login", { system: "dark", saved: "light" });

    expectTheme("light");
  });

  it("mantém a escolha dentro do app e alterna pelo cabeçalho", () => {
    cy.loginByApi(users.student.email, users.password).then((session) => {
      visitWithTheme("/dashboard", { system: "light", saved: "dark", session });

      cy.contains("h1", "Oi,").should("be.visible");
      expectTheme("dark");

      cy.get(`header ${toggle}`).click();
      expectTheme("light");

      cy.reload();
      cy.contains("h1", "Oi,").should("be.visible");
      expectTheme("light");
    });
  });
});
