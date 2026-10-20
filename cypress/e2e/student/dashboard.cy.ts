import users from "../../fixtures/users.json";
import {
  isPending,
  type Mission,
  type Page,
  type User,
  type XpHistoryItem,
} from "../../support/api-types";
import type { ApiSession } from "../../support/session";

/** Card de estatística pelo rótulo, para conferir o número ao lado. */
function statCard(label: string) {
  return cy.contains("main p", label).parent();
}

// A Ana é a aluna destaque do seed:demo: tem XP, histórico e já fez todas as
// missões da turma, algumas sem nota máxima.
describe("Dashboard de quem já pontuou", () => {
  let session: ApiSession;
  let user: User;
  let missions: Mission[];

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
        return cy.apiGet<Page<Mission>>(
          "/missions?limit=100&active=true",
          session.accessToken,
        );
      })
      .then((page) => {
        missions = page.docs;
      });
  });

  function pendingMissions() {
    const progress = new Map(
      user.mission_progress.map((entry) => [entry.mission_id, entry]),
    );

    return missions.filter((mission) =>
      isPending(mission, progress.get(mission._id)),
    );
  }

  it("mostra a saudação, o XP, o nível e a contagem de missões", () => {
    cy.visitWithSession("/dashboard", session);

    cy.contains("h1", `Oi, ${user.name.split(" ")[0]}!`).should("be.visible");
    statCard("Total XP").should("contain", user.xp);
    statCard(`${user.progress.xp_to_next_level} XP para o nível`).should(
      "contain",
      `Nível ${user.level}`,
    );
    statCard("Para fazer").should("contain", pendingMissions().length);
    statCard("Completas").should(
      "contain",
      user.mission_progress.filter((entry) => entry.done).length,
    );
  });

  it("sugere melhorar a nota e recomenda as missões que ainda rendem XP", () => {
    const pendingIds = pendingMissions().map(
      (mission) => `/missoes/${mission._id}`,
    );

    cy.visitWithSession("/dashboard", session);

    // Ela já fez todas, então a próxima ação é refazer uma abaixo de 100%.
    cy.contains("a", "Melhorar a nota")
      .should("have.attr", "href")
      .and("be.oneOf", pendingIds);

    cy.contains("section", "Missões recomendadas")
      .find('a[href^="/missoes/"]')
      .should("have.length", Math.min(3, pendingIds.length))
      .each((card) => {
        expect(pendingIds).to.include(card.attr("href"));
      });

    cy.contains("a", "Melhorar a nota").click();
    cy.contains("Sua melhor nota aqui é").should("be.visible");
  });

  it("leva para a lista completa de missões", () => {
    cy.visitWithSession("/dashboard", session);

    cy.contains("section", "Missões recomendadas")
      .contains("a", "Ver todas")
      .click();

    cy.location("pathname").should("eq", "/missoes");
  });

  it("mostra o histórico de XP com paginação", () => {
    cy.apiGet<Page<XpHistoryItem>>(
      `/users/${user._id}/xp-history?page=1&limit=5`,
      session.accessToken,
    ).then((first) => {
      cy.visitWithSession("/dashboard", session);

      cy.contains("#historico", `${first.totalDocs} registros`).should(
        "be.visible",
      );
      cy.get("#historico li").should("have.length", first.docs.length);
      cy.get("#historico li").first().should("contain", first.docs[0].title);
      cy.contains("#historico", `Página 1 de ${first.totalPages}`).should(
        "be.visible",
      );

      cy.apiGet<Page<XpHistoryItem>>(
        `/users/${user._id}/xp-history?page=2&limit=5`,
        session.accessToken,
      ).then((second) => {
        cy.contains("#historico button", "Próxima").click();

        cy.contains("#historico", `Página 2 de ${first.totalPages}`).should(
          "be.visible",
        );
        cy.get("#historico li").first().should("contain", second.docs[0].title);
      });
    });
  });

  it("mostra a anotação mais recente do professor", () => {
    cy.apiGet<Page<XpHistoryItem>>(
      `/users/${user._id}/xp-history?page=1&limit=10`,
      session.accessToken,
    ).then((history) => {
      // Mesma regra do TeacherNote: atitude traz o professor em `detail`,
      // ajuste em `teacher`; missão não tem professor.
      const teacher = history.docs
        .map((item) =>
          item.kind === "attitude"
            ? item.detail
            : item.kind === "adjustment"
              ? item.teacher
              : null,
        )
        .find(Boolean);

      cy.visitWithSession("/dashboard", session);

      cy.contains(`Anotação de ${teacher}`).should("be.visible");
      cy.contains("a", "Ver histórico").click();
      cy.location("hash").should("eq", "#historico");
    });
  });
});

// O Arthur acabou de chegar no seed:demo: nenhuma missão feita e XP zerado.
describe("Dashboard de quem acabou de chegar", () => {
  beforeEach(() => {
    cy.loginByApi(users.newStudent.email, users.password).then((session) => {
      cy.visitWithSession("/dashboard", session);
    });
  });

  it("aponta a primeira missão e explica o histórico vazio", () => {
    cy.contains("h1", "Oi, Arthur!").should("be.visible");
    cy.contains("Próxima missão:").should("be.visible");
    cy.contains("a", "Começar missão").should("have.attr", "href");
    statCard("Total XP").should("contain", 0);
    statCard("Completas").should("contain", 0);

    cy.contains("Seu XP ainda não mudou.").should("be.visible");
    cy.contains("Turma de ").should("be.visible");
  });
});
