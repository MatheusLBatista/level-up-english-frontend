import users from "../../fixtures/users.json";
import { envelope } from "../../support/api-types";
import type { ApiSession } from "../../support/session";

const bell = 'header button[title="Notificações"]';
const panel = '[data-slot="popover-content"]';
const item = '[data-slot="notification-item"]';

type NotificationStub = {
  _id: string;
  type: "attitude" | "xp_adjustment" | "new_mission";
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
};

function notification(
  index: number,
  overrides: Partial<NotificationStub> = {},
): NotificationStub {
  return {
    _id: `notification-${index}`,
    type: "attitude",
    message: `Atitude registrada ${index} (+10 XP).`,
    data: { xp: 10, attitude: "attitude-1", attitude_log: `log-${index}` },
    read: false,
    createdAt: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

function stubPage(
  page: number,
  docs: NotificationStub[],
  hasNextPage = false,
  alias = `page${page}`,
) {
  cy.intercept(
    { method: "GET", pathname: "/notifications", query: { page: `${page}` } },
    {
      body: envelope({
        docs,
        totalDocs: docs.length,
        limit: 10,
        page,
        totalPages: hasNextPage ? page + 1 : page,
        hasPrevPage: page > 1,
        hasNextPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
      }),
    },
  ).as(alias);
}

function stubUnread(unread: number) {
  cy.intercept("GET", "**/notifications/unread-count", {
    body: envelope({ unread }),
  }).as("unread");
}

function setTabVisibility(state: "visible" | "hidden") {
  cy.document().then((doc) => {
    Object.defineProperty(doc, "visibilityState", {
      configurable: true,
      get: () => state,
    });
    doc.dispatchEvent(new Event("visibilitychange", { bubbles: true }));
  });
}

describe("Sino de notificações", () => {
  let session: ApiSession;

  beforeEach(() => {
    cy.loginByApi(users.student.email, users.password).then((created) => {
      session = created;
    });
  });

  it("mostra 9+ quando há mais de nove não lidas", () => {
    stubUnread(12);

    cy.visitWithSession("/dashboard", session);

    cy.get(bell)
      .should("have.attr", "aria-label", "Notificações, 12 não lidas")
      .find('[data-slot="notification-count"]')
      .should("have.text", "9+");
  });

  it("mostra o número exato até nove e some sem não lidas", () => {
    stubUnread(3);
    cy.visitWithSession("/dashboard", session);

    cy.get(bell)
      .should("have.attr", "aria-label", "Notificações, 3 não lidas")
      .find('[data-slot="notification-count"]')
      .should("have.text", "3");

    stubUnread(0);
    cy.visitWithSession("/dashboard", session);

    cy.get(bell)
      .should("have.attr", "aria-label", "Notificações")
      .find('[data-slot="notification-count"]')
      .should("not.exist");
  });

  it("consulta a cada minuto e pausa com a aba oculta", () => {
    stubUnread(1);
    cy.clock();

    cy.visitWithSession("/dashboard", session);
    cy.wait("@unread");

    cy.tick(60 * 1000);
    cy.wait("@unread");

    setTabVisibility("hidden");
    cy.tick(3 * 60 * 1000);
    cy.get("@unread.all").should("have.length", 2);

    setTabVisibility("visible");
    cy.wait("@unread");
    cy.get("@unread.all").should("have.length", 3);
  });

  it("para de consultar depois do logout", () => {
    stubUnread(1);
    cy.clock();

    cy.visitWithSession("/dashboard", session);
    cy.wait("@unread");

    cy.contains("button", "Sair").click();
    cy.location("pathname").should("eq", "/login");

    cy.tick(3 * 60 * 1000);
    cy.get("@unread.all").should("have.length", 1);
  });

  it("não aparece para o professor", () => {
    cy.loginByApi(users.teacher.email, users.password).then((teacher) => {
      cy.visitWithSession("/painel", teacher);
    });

    cy.get('header [aria-label="Alternar entre tema claro e escuro"]').should(
      "be.visible",
    );
    cy.get(bell).should("not.exist");
  });
});

describe("Painel de notificações", () => {
  let session: ApiSession;

  beforeEach(() => {
    stubUnread(2);
    cy.loginByApi(users.student.email, users.password).then((created) => {
      session = created;
    });
  });

  it("lista as notificações com destaque nas não lidas e ícone por tipo", () => {
    stubPage(1, [
      notification(2, {
        message: "Atitude registrada: Participação (+10 XP).",
      }),
      notification(26, {
        type: "xp_adjustment",
        message: "Seu professor ajustou seu XP (-5 XP).",
        data: { xp: -5, xp_adjustment: "adjustment-1" },
        read: true,
      }),
      notification(72, {
        type: "new_mission",
        message: "Nova missão: Colors.",
        data: { mission: "mission-1" },
      }),
    ]);

    cy.visitWithSession("/dashboard", session);
    cy.get(bell).click();
    cy.wait("@page1");

    cy.get(panel).within(() => {
      cy.get(item).should("have.length", 3);
      cy.get(item)
        .eq(0)
        .should("have.attr", "data-read", "false")
        .and("contain", "Atitude registrada: Participação (+10 XP).")
        .and("contain", "há 2 horas")
        .and("contain", "Não lida")
        .find('[data-tone="positive"]')
        .should("exist");
      cy.get(item)
        .eq(1)
        .should("have.attr", "data-read", "true")
        .and("contain", "ontem")
        .and("not.contain", "Não lida")
        .find('[data-tone="negative"]')
        .should("exist");
      cy.get(item)
        .eq(2)
        .should("contain", "há 3 dias")
        .find('[data-tone="mission"]')
        .should("exist");
    });
  });

  it("carrega mais enquanto houver próxima página", () => {
    stubPage(
      1,
      Array.from({ length: 10 }, (_, index) => notification(index + 1)),
      true,
    );
    stubPage(2, [notification(11), notification(12)]);

    cy.visitWithSession("/dashboard", session);
    cy.get(bell).click();
    cy.get(item).should("have.length", 10);

    cy.contains(`${panel} button`, "Carregar mais").click();
    cy.wait("@page2");

    cy.get(item).should("have.length", 12);
    cy.contains(`${panel} button`, "Carregar mais").should("not.exist");
  });

  it("mostra o estado vazio", () => {
    stubPage(1, []);

    cy.visitWithSession("/dashboard", session);
    cy.get(bell).click();

    cy.contains(panel, "Você não tem notificações.").should("be.visible");
  });

  it("mostra o erro e deixa tentar de novo", () => {
    cy.intercept(
      { method: "GET", pathname: "/notifications", times: 3 },
      {
        statusCode: 500,
        body: { message: "Erro interno do servidor.", data: null, errors: [] },
      },
    );

    cy.visitWithSession("/dashboard", session);
    cy.get(bell).click();

    cy.contains(panel, "Não foi possível carregar as notificações.").should(
      "be.visible",
    );

    stubPage(1, [notification(1)]);
    cy.contains(`${panel} button`, "Tentar de novo").click();

    cy.get(item).should("have.length", 1);
  });

  it("fecha com Esc e com clique fora", () => {
    stubPage(1, [notification(1)]);

    cy.visitWithSession("/dashboard", session);
    cy.get(bell).click();
    cy.get(panel).should("be.visible");

    cy.get("body").type("{esc}");
    cy.get(panel).should("not.exist");
    cy.focused().should("match", bell);

    cy.get(bell).click();
    cy.get(panel).should("be.visible");
    cy.get("main").click("topLeft");
    cy.get(panel).should("not.exist");
  });

  it("ocupa a largura da tela no celular sem rolagem lateral", () => {
    stubPage(1, [
      notification(1, {
        message:
          "Atitude registrada: Participação ativa durante toda a aula de revisão (+10 XP). Você subiu para o nível 4!",
      }),
    ]);
    cy.viewport(375, 800);

    cy.visitWithSession("/dashboard", session);
    cy.get(bell).click();

    cy.get(panel).invoke("outerWidth").should("eq", 375);
    cy.document().its("documentElement.scrollWidth").should("eq", 375);
  });
});

describe("Ler notificações", () => {
  let session: ApiSession;

  const mission = notification(1, {
    type: "new_mission",
    message: "Nova missão: Colors.",
    data: { mission: "mission-1" },
  });
  const attitude = notification(2);
  const adjustment = notification(3, {
    type: "xp_adjustment",
    message: "Seu professor ajustou seu XP (-5 XP).",
    data: { xp: -5, xp_adjustment: "adjustment-1" },
  });

  beforeEach(() => {
    cy.loginByApi(users.student.email, users.password).then((created) => {
      session = created;
    });
  });

  function openPanel() {
    cy.visitWithSession("/dashboard", session);
    cy.get(bell).click();
    cy.get(item).should("have.length.greaterThan", 0);
  }

  it("cada notificação é um link para a tela do tipo", () => {
    stubUnread(3);
    stubPage(1, [mission, attitude, adjustment]);
    openPanel();

    cy.get(`${item} a`).eq(0).should("have.attr", "href", "/missoes/mission-1");
    cy.get(`${item} a`)
      .eq(1)
      .should("have.attr", "href", "/dashboard#historico");
    cy.get(`${item} a`)
      .eq(2)
      .should("have.attr", "href", "/dashboard#historico");
  });

  it("marca como lida na hora e abre a missão", () => {
    let countCalls = 0;
    cy.intercept("GET", "**/notifications/unread-count", (request) => {
      countCalls += 1;
      request.reply({ body: envelope({ unread: countCalls === 1 ? 3 : 2 }) });
    });
    stubPage(1, [mission, attitude, adjustment]);
    cy.intercept("PATCH", "**/notifications/notification-1/read", {
      delay: 1000,
      body: envelope({ ...mission, read: true }),
    }).as("read");
    openPanel();

    cy.get(`${item} a`).eq(0).click();

    cy.get(bell).should("have.attr", "aria-label", "Notificações, 2 não lidas");
    cy.get(panel).should("not.exist");
    cy.location("pathname").should("eq", "/missoes/mission-1");
    cy.wait("@read");
  });

  it("desfaz a marcação quando a API falha", () => {
    let countCalls = 0;
    cy.intercept("GET", "**/notifications/unread-count", (request) => {
      countCalls += 1;
      request.reply({
        delay: countCalls === 1 ? 0 : 8000,
        body: envelope({ unread: 3 }),
      });
    });
    stubPage(1, [mission, attitude, adjustment]);
    cy.intercept("PATCH", "**/notifications/notification-2/read", {
      delay: 1000,
      statusCode: 500,
      body: { message: "Erro interno do servidor.", data: null, errors: [] },
    }).as("read");
    openPanel();

    cy.get(`${item} a`).eq(1).click();
    cy.get(bell).should("have.attr", "aria-label", "Notificações, 2 não lidas");

    cy.wait("@read");
    cy.get(bell).should("have.attr", "aria-label", "Notificações, 3 não lidas");
  });

  it("não chama a API ao abrir uma notificação já lida", () => {
    stubUnread(0);
    stubPage(1, [{ ...attitude, read: true }]);
    cy.intercept("PATCH", "**/notifications/*/read").as("read");
    openPanel();

    cy.get(`${item} a`).first().click();

    cy.location("hash").should("eq", "#historico");
    cy.get(panel).should("not.exist");
    cy.get("@read.all").should("have.length", 0);
  });

  it("marca todas como lidas e zera o contador", () => {
    stubUnread(2);
    stubPage(1, [mission, attitude, { ...adjustment, read: true }]);
    cy.intercept("PATCH", "**/notifications/read-all", {
      body: envelope({ updated: 2 }),
    }).as("readAll");
    openPanel();

    cy.contains(`${panel} button`, "Marcar todas como lidas").click();
    cy.wait("@readAll");

    cy.get(item).each((element) => {
      cy.wrap(element).should("have.attr", "data-read", "true");
    });
    cy.get(bell)
      .should("have.attr", "aria-label", "Notificações")
      .find('[data-slot="notification-count"]')
      .should("not.exist");
    cy.contains(`${panel} button`, "Marcar todas como lidas").should(
      "be.disabled",
    );
  });

  it("deixa marcar todas desabilitado sem não lidas", () => {
    stubUnread(0);
    stubPage(1, [{ ...attitude, read: true }]);
    openPanel();

    cy.contains(`${panel} button`, "Marcar todas como lidas").should(
      "be.disabled",
    );
  });
});
