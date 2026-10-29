import users from "../../fixtures/users.json";
import {
  envelope,
  performanceSummary,
  type Attitude,
  type ClassSummary,
  type Page,
  type Performance,
  type User,
} from "../../support/api-types";
import type { ApiSession } from "../../support/session";

/** Cartão do aluno na grade (o botão que marca e desmarca). */
function studentCard(name: string) {
  return cy.contains("main li button", name);
}

// A Carla é a professora do 1º Ano A no seed:demo. Tudo que grava (atitudes,
// ajustes de XP, novo aluno) é simulado, para não mudar o XP da demonstração.
describe("Painel do professor", () => {
  let session: ApiSession;
  let schoolClass: ClassSummary;
  let students: User[];

  beforeEach(() => {
    cy.loginByApi(users.teacher.email, users.password)
      .then((created) => {
        session = created;
        return cy.apiGet<Page<ClassSummary>>(
          `/classes?limit=100&active=true&teacher=${created.user._id}`,
          created.accessToken,
        );
      })
      .then((classes) => {
        schoolClass = classes.docs[0];
        return cy.apiGet<Page<User>>(
          `/users?role=student&class=${schoolClass._id}&active=true&limit=100`,
          session.accessToken,
        );
      })
      .then((page) => {
        students = page.docs;
        cy.visitWithSession("/painel", session);
      });
  });

  it("mostra os alunos da turma", () => {
    cy.contains("h1", "Painel da turma").should("be.visible");
    cy.get('[aria-label="Turma"]').should("contain", schoolClass.name);

    // +1 pelo cartão "Selecionar todos".
    cy.get("main ul > li").should("have.length", students.length + 1);
    students.forEach((student) => {
      studentCard(student.name)
        .should("contain", `Nível ${student.level}`)
        .and("contain", "XP");
    });
  });

  it("pesquisa aluno pelo nome, sem diferenciar acento e maiúscula", () => {
    const [first, second] = students;
    const term = first.name.split(" ")[0].toUpperCase();

    cy.get('[aria-label="Pesquisar aluno"]').type(term);

    studentCard(first.name).should("be.visible");
    studentCard(second.name).should("not.exist");

    cy.get('[aria-label="Pesquisar aluno"]')
      .clear()
      .type("ninguem-com-esse-nome");
    cy.contains("Nenhum aluno encontrado para “ninguem-com-esse-nome”.").should(
      "be.visible",
    );
  });

  it("marca alunos um a um, todos de uma vez e limpa a seleção", () => {
    cy.contains("Nenhum aluno selecionado").should("be.visible");
    cy.contains("button", "Aplicar atitude").should("be.disabled");
    cy.contains("button", "Ajustar XP").should("be.disabled");

    studentCard(students[0].name)
      .click()
      .should("have.attr", "aria-pressed", "true");
    studentCard(students[1].name).click();
    cy.contains("2 alunos selecionados").should("be.visible");
    cy.contains("button", "Aplicar atitude").should("be.enabled");

    cy.contains("button", "Selecionar todos").click();
    cy.contains(`${students.length} alunos selecionados`).should("be.visible");
    cy.contains("button", "Desmarcar todos").should("be.visible");

    cy.contains("button", "Limpar").click();
    cy.contains("Nenhum aluno selecionado").should("be.visible");
  });

  it("abre a ficha do aluno", () => {
    const student = students[0];

    cy.get(`[aria-label="Ver ficha de ${student.name}"]`).click();

    cy.get('[role="dialog"]')
      .should("contain", student.name)
      .and("contain", `Nível ${student.level}`)
      .and("contain", "Histórico de XP");
  });

  it("mostra o radar de desempenho na ficha do aluno", () => {
    const student = students[0];

    cy.intercept("GET", `**/users/${student._id}/performance*`).as(
      "performance",
    );
    cy.apiGet<Performance>(
      `/users/${student._id}/performance`,
      session.accessToken,
    ).then((performance) => {
      cy.get(`[aria-label="Ver ficha de ${student.name}"]`).click();

      cy.wait("@performance").its("response.statusCode").should("eq", 200);
      cy.contains('[role="dialog"] section', "Desempenho").within(() => {
        cy.get("svg.recharts-surface").should("be.visible");
        cy.contains(".recharts-legend-wrapper", "Aluno").should("be.visible");
        performanceSummary(performance, "Aluno").forEach((line) => {
          cy.get("figcaption").should("contain.text", line);
        });
      });
    });
  });

  describe("Aplicar atitudes", () => {
    let attitudes: Attitude[];

    beforeEach(() => {
      cy.apiGet<Page<Attitude>>(
        "/attitudes?limit=100&active=true",
        session.accessToken,
      ).then((page) => {
        attitudes = page.docs;
      });
    });

    it("aplica duas atitudes a dois alunos e permite desfazer", () => {
      const chosen = students.slice(0, 2);
      const picked = attitudes
        .filter((attitude) => attitude.type === "positive")
        .slice(0, 2);
      const total = picked.reduce((sum, item) => sum + item.xp_value, 0);
      const sent: { student: string; attitude: string }[] = [];

      cy.intercept("POST", "**/attitude-logs", (request) => {
        sent.push(request.body);
        request.reply({
          body: envelope({
            _id: `log-${sent.length}`,
            ...request.body,
            xp_applied: 10,
          }),
        });
      }).as("apply");
      cy.intercept("DELETE", "**/attitude-logs/*", {
        body: envelope(null),
      }).as("undo");

      chosen.forEach((student) => studentCard(student.name).click());
      cy.contains("button", "Aplicar atitude").click();

      cy.contains('[role="dialog"]', "Aplicar atitudes").should(
        "contain",
        "Para 2 alunos",
      );
      cy.contains('[role="dialog"] button', "Escolha uma atitude").should(
        "be.disabled",
      );
      picked.forEach((attitude) => {
        cy.contains('[role="dialog"] button', attitude.name).click();
      });
      cy.contains(
        '[role="dialog"] button',
        `Aplicar +${total} XP a 2 alunos`,
      ).click();

      // Uma requisição por aluno e por atitude.
      cy.get("@apply.all").should("have.length", 4);
      cy.wrap(sent).should("have.deep.members", [
        ...chosen.flatMap((student) =>
          picked.map((attitude) => ({
            student: student._id,
            attitude: attitude._id,
          })),
        ),
      ]);
      cy.contains("2 atitudes aplicadas a 2 alunos").should("be.visible");
      cy.contains(`+${total} XP`).should("be.visible");

      cy.contains('[role="dialog"] button', "Desfazer").click();
      cy.get("@undo.all").should("have.length", 4);
      cy.contains("Atitudes desfeitas").should("be.visible");

      cy.contains('[role="dialog"] button', "Fechar").click();
      cy.contains("Nenhum aluno selecionado").should("be.visible");
    });

    it("mostra quais aplicações falharam", () => {
      const [ok, failing] = students;
      const attitude = attitudes[0];

      cy.intercept("POST", "**/attitude-logs", (request) => {
        if (request.body.student === failing._id) {
          request.reply({
            statusCode: 400,
            body: {
              message: "Aluno fora da sua turma.",
              data: null,
              errors: [],
            },
          });
          return;
        }

        request.reply({
          body: envelope({ _id: "log-1", ...request.body, xp_applied: 10 }),
        });
      });

      studentCard(ok.name).click();
      studentCard(failing.name).click();
      cy.contains("button", "Aplicar atitude").click();
      cy.contains('[role="dialog"] button', attitude.name).click();
      cy.contains('[role="dialog"] button', "a 2 alunos").click();

      cy.contains("1 de 2 aplicadas").should("be.visible");
      cy.contains('[role="dialog"] li', "Aluno fora da sua turma.").should(
        "contain",
        failing.name,
      );
    });
  });

  describe("Ajustar XP", () => {
    it("exige a quantidade de XP", () => {
      cy.intercept("POST", "**/xp-adjustments").as("adjust");

      studentCard(students[0].name).click();
      cy.contains("button", "Ajustar XP").click();
      cy.contains('[role="dialog"] button', "Confirmar adição").click();

      cy.contains("Informe a quantidade de XP.").should("be.visible");
      cy.get("@adjust.all").should("have.length", 0);
    });

    it("adiciona XP com motivo a vários alunos", () => {
      const chosen = students.slice(0, 2);
      const sent: object[] = [];

      cy.intercept("POST", "**/xp-adjustments", (request) => {
        sent.push(request.body);
        request.reply({
          body: envelope({
            _id: "adj-1",
            ...request.body,
            xp_applied: request.body.amount,
          }),
        });
      });

      chosen.forEach((student) => studentCard(student.name).click());
      cy.contains("button", "Ajustar XP").click();
      cy.get("#amount").type("50");
      cy.get("#reason").type("Feira de ciências");
      cy.contains('[role="dialog"] button', "Confirmar adição").click();

      cy.contains("XP de 2 alunos ajustado").should("be.visible");
      cy.contains("+50 XP por aluno").should("be.visible");
      cy.wrap(sent).should(
        "have.deep.members",
        chosen.map((student) => ({
          student: student._id,
          amount: 50,
          reason: "Feira de ciências",
        })),
      );
    });

    it("avisa e mostra quando o XP do aluno para em zero", () => {
      const poorest = [...students].sort((a, b) => a.xp - b.xp)[0];
      const amount = poorest.xp + 100;

      cy.intercept("POST", "**/xp-adjustments", (request) => {
        request.reply({
          body: envelope({
            _id: "adj-1",
            ...request.body,
            xp_applied: -poorest.xp,
          }),
        });
      }).as("adjust");

      studentCard(poorest.name).click();
      cy.contains("button", "Ajustar XP").click();
      cy.contains('[role="dialog"] button', "Remover").click();
      cy.get("#amount").type(String(amount));

      cy.contains(`${poorest.name} tem só ${poorest.xp} XP`).should(
        "be.visible",
      );
      cy.contains('[role="dialog"] button', "Confirmar remoção").click();

      cy.wait("@adjust").its("request.body.amount").should("eq", -amount);
      cy.contains("XP insuficiente").should("be.visible");
      cy.contains(`removidos ${poorest.xp} de ${amount} XP`).should(
        "be.visible",
      );
    });
  });

  describe("Novo aluno", () => {
    beforeEach(() => {
      cy.contains("button", "Novo aluno").click();
    });

    it("valida nome e e-mail antes de chamar a API", () => {
      cy.intercept("POST", "**/auth/register-student").as("register");

      cy.get("#student-name").type("A");
      cy.get("#student-email").type("nao-e-email");
      cy.contains('[role="dialog"] button', "Criar aluno").click();

      cy.contains("Use pelo menos 2 letras no nome.").should("be.visible");
      cy.contains("Digite um e-mail válido.").should("be.visible");
      cy.get("@register.all").should("have.length", 0);
    });

    it("mostra no campo o erro de e-mail já cadastrado", () => {
      // Chamada real: o e-mail já existe, então o backend recusa sem criar nada.
      cy.get("#student-name").type("Aluno Repetido");
      cy.get("#student-email").type(users.student.email);
      cy.contains('[role="dialog"] button', "Criar aluno").click();

      cy.get("#student-email").should("have.attr", "aria-invalid", "true");
      cy.contains("Este e-mail já está cadastrado.").should("be.visible");
    });

    it("cadastra o aluno na turma do painel", () => {
      const name = "Bruno Teste";
      const email = "bruno.teste@levelup.edu.br";

      cy.intercept("POST", "**/auth/register-student", (request) => {
        request.reply({
          body: envelope({ _id: "new-student", ...request.body }),
        });
      }).as("register");

      cy.get("#student-name").type(name);
      cy.get("#student-email").type(email.toUpperCase());
      cy.contains('[role="dialog"] button', "Criar aluno").click();

      cy.wait("@register")
        .its("request.body")
        .should("deep.eq", { name, email, class: schoolClass._id });
      cy.contains('[role="dialog"]', "Aluno criado")
        .should("contain", name)
        .and("contain", email);
    });
  });
});

describe("Acesso do professor", () => {
  beforeEach(() => {
    cy.loginByApi(users.teacher.email, users.password).as("session");
  });

  ["/dashboard", "/turmas", "/atitudes"].forEach((path) => {
    it(`não abre ${path} e volta para o painel`, () => {
      cy.get<ApiSession>("@session").then((session) => {
        cy.visitWithSession(path, session);
      });

      cy.location("pathname").should("eq", "/painel");
    });
  });
});
