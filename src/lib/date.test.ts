import { describe, it, expect } from "vitest";
import { todayInTashkent, isValidDateString, daysAgoInTashkent } from "./date";

describe("todayInTashkent", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(todayInTashkent()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("isValidDateString", () => {
  it("accepts valid ISO date strings", () => {
    expect(isValidDateString("2026-07-16")).toBe(true);
  });

  it("rejects malformed strings", () => {
    expect(isValidDateString("2026-7-16")).toBe(false);
    expect(isValidDateString("16-07-2026")).toBe(false);
    expect(isValidDateString("not-a-date")).toBe(false);
    expect(isValidDateString("")).toBe(false);
  });
});

describe("daysAgoInTashkent", () => {
  it("returns a valid date string N days before today", () => {
    const today = todayInTashkent();
    const weekAgo = daysAgoInTashkent(7);
    expect(isValidDateString(weekAgo)).toBe(true);
    expect(weekAgo <= today).toBe(true);
  });

  it("0 days ago equals today", () => {
    expect(daysAgoInTashkent(0)).toBe(todayInTashkent());
  });
});
