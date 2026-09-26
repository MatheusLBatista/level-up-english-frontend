import type { Attitude } from "@/lib/types";

export function getAttitudeXp(attitude: Attitude) {
  const value = Math.abs(attitude.xp_value);

  return attitude.type === "negative" ? -value : value;
}

export function formatXpDelta(xp: number) {
  return `${xp > 0 ? "+" : ""}${xp} XP`;
}
