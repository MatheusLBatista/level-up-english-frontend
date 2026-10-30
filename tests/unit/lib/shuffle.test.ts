import { describe, expect, it } from "vitest";
import { shuffle } from "@/lib/shuffle";

describe("shuffle", () => {
  it("mantém os mesmos elementos", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];

    const result = shuffle(items);

    expect(result).toHaveLength(items.length);
    expect([...result].sort((a, b) => a - b)).toEqual(items);
  });

  it("não muta a entrada", () => {
    const items = [1, 2, 3, 4, 5];

    const result = shuffle(items);

    expect(items).toEqual([1, 2, 3, 4, 5]);
    expect(result).not.toBe(items);
  });

  it("troca cada posição com a sorteada", () => {
    expect(shuffle(["a", "b", "c", "d"], () => 0)).toEqual([
      "b",
      "c",
      "d",
      "a",
    ]);
    expect(shuffle(["a", "b", "c", "d"], () => 0.99)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  it("aceita lista vazia", () => {
    expect(shuffle([])).toEqual([]);
  });
});
