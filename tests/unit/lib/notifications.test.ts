import { describe, expect, it } from "vitest";
import {
  formatUnreadCount,
  notificationHref,
  notificationsLabel,
} from "@/lib/notifications";

describe("formatUnreadCount", () => {
  it("mostra o número até 9", () => {
    expect(formatUnreadCount(1)).toBe("1");
    expect(formatUnreadCount(9)).toBe("9");
  });

  it("mostra 9+ acima de 9", () => {
    expect(formatUnreadCount(10)).toBe("9+");
    expect(formatUnreadCount(250)).toBe("9+");
  });
});

describe("notificationsLabel", () => {
  it("não fala de não lidas quando não há nenhuma", () => {
    expect(notificationsLabel(0)).toBe("Notificações");
  });

  it("usa singular e plural com o número real", () => {
    expect(notificationsLabel(1)).toBe("Notificações, 1 não lida");
    expect(notificationsLabel(12)).toBe("Notificações, 12 não lidas");
  });
});

describe("notificationHref", () => {
  const base = {
    _id: "n1",
    user: "u1",
    message: "",
    read: false,
    createdAt: "",
    updatedAt: "",
  };

  it("leva a nova missão para a tela da missão", () => {
    expect(
      notificationHref({
        ...base,
        type: "new_mission",
        data: { mission: "m1" },
      }),
    ).toBe("/missoes/m1");
  });

  it("leva atitude e ajuste para o histórico de XP", () => {
    expect(
      notificationHref({
        ...base,
        type: "attitude",
        data: { xp: 10, attitude: "a1", attitude_log: "l1" },
      }),
    ).toBe("/dashboard#historico");
    expect(
      notificationHref({
        ...base,
        type: "xp_adjustment",
        data: { xp: -5, xp_adjustment: "x1" },
      }),
    ).toBe("/dashboard#historico");
  });
});
