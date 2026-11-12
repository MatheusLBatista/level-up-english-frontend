const legalNotice = "Texto modelo.";

// Páginas públicas: abrem sem sessão, como para um responsável sem conta.
describe("Páginas legais", () => {
  it("abre a política de privacidade sem login, com os itens da LGPD", () => {
    cy.visit("/privacidade");

    cy.contains("h1", "Política de privacidade").should("be.visible");
    cy.location("pathname").should("eq", "/privacidade");

    [
      "Nome",
      "E-mail",
      "Foto de perfil (opcional)",
      "Desempenho nas missões",
      "XP, nível e histórico de XP",
      "Atitudes registradas pelo professor",
      "Posição nos rankings",
      "Notificações",
    ].forEach((data) => {
      cy.contains("main table td", data).should("exist");
    });

    cy.contains("h2", "Quem cuida dos dados")
      .parent()
      .should("contain", "controladora")
      .and("contain", "operador");
    cy.contains("h2", "Por quanto tempo")
      .parent()
      .should("contain", "12 meses")
      .and("contain", "7 dias");
    cy.contains("h2", "Direitos do titular").should("be.visible");
    cy.contains("h2", "Como revogar o consentimento").should("be.visible");
    cy.get('footer [role="note"]').should("contain", legalNotice);
  });

  it("abre os termos de uso com o aviso de modelo e o link para a política", () => {
    cy.visit("/termos");

    cy.contains("h1", "Termos de uso").should("be.visible");
    cy.get('footer [role="note"]').should("contain", "revisão jurídica");

    cy.contains("main a", "política de privacidade").first().click();
    cy.location("pathname").should("eq", "/privacidade");
  });

  it("deixa o termo dos responsáveis pronto para imprimir", () => {
    cy.visit("/termo-responsaveis", {
      onBeforeLoad(win) {
        cy.stub(win, "print").as("print");
      },
    });

    cy.contains("h1", "Termo de consentimento dos responsáveis").should(
      "be.visible",
    );
    cy.contains("Nome completo do responsável legal").should("exist");
    cy.contains("Assinatura do responsável legal").should("exist");
    cy.contains("revogar este consentimento").should("exist");
    cy.get('footer [role="note"]').should("contain", legalNotice);

    cy.contains("button", "Imprimir termo").click();
    cy.get("@print").should("have.been.calledOnce");
  });

  it("mostra os links legais na tela de login", () => {
    cy.visit("/login");

    cy.get('nav[aria-label="Documentos legais"]').within(() => {
      cy.contains("a", "Política de privacidade").should(
        "have.attr",
        "href",
        "/privacidade",
      );
      cy.contains("a", "Termos de uso").should("have.attr", "href", "/termos");
      cy.contains("a", "Termo dos responsáveis").click();
    });

    cy.location("pathname").should("eq", "/termo-responsaveis");
  });
});
