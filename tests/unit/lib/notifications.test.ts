import { describe, expect, it } from "vitest";
import { formatUnreadCount, notificationsLabel } from "@/lib/notifications";

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
