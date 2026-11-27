import { describe, expect, it } from "vitest";
import {
  formDraftKey,
  isSameFormValues,
  parseFormDraft,
  type FormDraft,
} from "@/lib/form-draft";

type Values = { title: string; xp: number };

const base: Values = { title: "Colors", xp: 100 };

function raw(overrides: Partial<FormDraft<Values>> = {}) {
  return JSON.stringify({
    values: { title: "Colors and shapes", xp: 120 },
    base,
    savedAt: "2026-11-26T20:00:00.000Z",
    ...overrides,
  });
}

describe("parseFormDraft", () => {
  it("devolve null quando não há rascunho", () => {
    expect(parseFormDraft(null, base, { checkBase: true })).toBeNull();
  });

  it("ignora JSON quebrado ou sem valores", () => {
    expect(parseFormDraft("{oops", base, { checkBase: false })).toBeNull();
    expect(parseFormDraft("null", base, { checkBase: false })).toBeNull();
    expect(parseFormDraft("{}", base, { checkBase: false })).toBeNull();
  });

  it("recupera o rascunho quando o item não mudou", () => {
    expect(parseFormDraft(raw(), base, { checkBase: true })?.values).toEqual({
      title: "Colors and shapes",
      xp: 120,
    });
  });

  it("descarta o rascunho da edição se o item mudou depois", () => {
    const changed = { ...base, xp: 150 };

    expect(parseFormDraft(raw(), changed, { checkBase: true })).toBeNull();
  });

  it("no cadastro não compara a base (ex.: turma do filtro mudou)", () => {
    const otherDefaults = { ...base, title: "" };

    expect(
      parseFormDraft(raw(), otherDefaults, { checkBase: false }),
    ).not.toBeNull();
  });
});

describe("formDraftKey", () => {
  it("separa por formulário, usuário e item", () => {
    expect(formDraftKey("mission-form", "u1", null)).toBe(
      "levelup-english:mission-form-draft:u1:new",
    );
    expect(formDraftKey("attitude-form", "u1", "a1")).toBe(
      "levelup-english:attitude-form-draft:u1:a1",
    );
  });
});

describe("isSameFormValues", () => {
  it("compara pelo conteúdo", () => {
    expect(isSameFormValues(base, structuredClone(base))).toBe(true);
    expect(isSameFormValues(base, { ...base, xp: 1 })).toBe(false);
  });
});
