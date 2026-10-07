import type { Attitude, AttitudeType } from "@/lib/types";
import type { AttitudeFormInput } from "@/schemas/attitude";

export function getAttitudeXp(attitude: Attitude) {
  const value = Math.abs(attitude.xp_value);

  return attitude.type === "negative" ? -value : value;
}

export function formatXpDelta(xp: number) {
  return `${xp > 0 ? "+" : ""}${xp} XP`;
}

/**
 * O backend guarda o XP sem sinal e o tipo à parte; o formulário usa um número
 * só, com sinal. Estas duas funções convertem entre os dois formatos.
 */
export function toAttitudeFormValues(
  attitude: Attitude | null,
): AttitudeFormInput {
  if (!attitude) {
    return { name: "", description: "", xp: 10 };
  }

  return {
    name: attitude.name,
    description: attitude.description ?? "",
    xp: getAttitudeXp(attitude),
  };
}

export function toAttitudeBody(values: AttitudeFormInput) {
  const type: AttitudeType = values.xp < 0 ? "negative" : "positive";

  return {
    name: values.name,
    description: values.description,
    xp_value: Math.abs(values.xp),
    type,
  };
}
