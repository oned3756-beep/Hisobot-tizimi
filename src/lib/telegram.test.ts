import { describe, it, expect } from "vitest";
import { buildMessage, escapeHtml, type ReportNotification } from "./telegram";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml("<b>Tour & Co</b>")).toBe("&lt;b&gt;Tour &amp; Co&lt;/b&gt;");
  });

  it("leaves plain text unchanged", () => {
    expect(escapeHtml("Kanatka yo'li")).toBe("Kanatka yo'li");
  });
});

describe("buildMessage", () => {
  const base: ReportNotification = {
    objectNameUz: "Kanatka yo'li",
    date: "2026-07-16",
    visitorCount: 42,
    cashAmount: 150000,
    cardAmount: 80000,
    transferAmount: 20000,
    qrAmount: 10000,
    totalAmount: 260000,
    organizations: [],
  };

  it("includes the object name, date, and totals", () => {
    const msg = buildMessage(base);
    expect(msg).toContain("Kanatka yo'li");
    expect(msg).toContain("2026-07-16");
    expect(msg).toContain("42");
    expect(msg).toContain("260,000");
  });

  it("lists organization breakdown when present", () => {
    const msg = buildMessage({
      ...base,
      organizations: [{ name: "ABC Tour", visitorCount: 20 }],
    });
    expect(msg).toContain("ABC Tour: 20");
  });

  it("omits the comment line when there is no comment", () => {
    const msg = buildMessage(base);
    expect(msg).not.toContain("📝");
  });

  it("includes and escapes the comment when present", () => {
    const msg = buildMessage({ ...base, comment: "<script>alert(1)</script>" });
    expect(msg).toContain("📝");
    expect(msg).not.toContain("<script>");
    expect(msg).toContain("&lt;script&gt;");
  });

  it("escapes organization names to prevent HTML injection", () => {
    const msg = buildMessage({
      ...base,
      organizations: [{ name: "<b>Evil</b>", visitorCount: 1 }],
    });
    expect(msg).not.toContain("<b>Evil</b>");
  });
});
