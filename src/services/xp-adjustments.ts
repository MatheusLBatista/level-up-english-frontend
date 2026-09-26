import { apiFetch } from "@/lib/api";
import { XpAdjustmentResult } from "@/lib/types";

export type XpAdjustmentBody = {
  student: string;
  amount: number;
  reason?: string;
};

export function createXpAdjustment(body: XpAdjustmentBody, token: string) {
  return apiFetch<XpAdjustmentResult>("/xp-adjustments", {
    method: "POST",
    body,
    token,
  });
}
