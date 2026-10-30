import { describe, expect, it } from "vitest";
import { toSingleLine } from "@/lib/text";

describe("toSingleLine", () => {
  it("troca a quebra de linha por espaço", () => {
    expect(toSingleLine("What color\nis the sky?")).toBe(
      "What color is the sky?",
    );
  });

  it("trata a quebra do Windows como uma só", () => {
    expect(toSingleLine("What color\r\nis the sky?")).toBe(
      "What color is the sky?",
    );
  });

  it("junta linhas em branco e espaços em volta num espaço só", () => {
    expect(toSingleLine("What color  \n\n  is the sky?")).toBe(
      "What color is the sky?",
    );
  });

  it("não mexe em texto de uma linha", () => {
    expect(toSingleLine("  What color is the sky?  ")).toBe(
      "  What color is the sky?  ",
    );
  });
});
