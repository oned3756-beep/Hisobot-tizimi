import { describe, it, expect } from "vitest";
import {
  reportSchema,
  objectSchema,
  createUserSchema,
  resetPasswordSchema,
  voucherSchema,
} from "./validation";

describe("reportSchema", () => {
  it("accepts a valid report payload", () => {
    const result = reportSchema.safeParse({
      date: "2026-07-16",
      cashAmount: "150000",
      cardAmount: "80000",
      transferAmount: "0",
      qrAmount: "10000",
      comment: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed date", () => {
    const result = reportSchema.safeParse({
      date: "16/07/2026",
      cashAmount: "0",
      cardAmount: "0",
      transferAmount: "0",
      qrAmount: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amounts", () => {
    const result = reportSchema.safeParse({
      date: "2026-07-16",
      cashAmount: "-100",
      cardAmount: "0",
      transferAmount: "0",
      qrAmount: "0",
    });
    expect(result.success).toBe(false);
  });
});

describe("objectSchema", () => {
  it("accepts a valid object/organization payload", () => {
    const result = objectSchema.safeParse({
      nameUz: "Kafe",
      nameRu: "Кафе",
      slug: "kafe",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a slug with uppercase or spaces", () => {
    expect(objectSchema.safeParse({ nameUz: "A", nameRu: "A", slug: "Kafe 1" }).success).toBe(false);
    expect(objectSchema.safeParse({ nameUz: "A", nameRu: "A", slug: "KAFE" }).success).toBe(false);
  });

  it("rejects empty names", () => {
    expect(objectSchema.safeParse({ nameUz: "", nameRu: "A", slug: "a" }).success).toBe(false);
  });
});

describe("createUserSchema", () => {
  it("accepts a valid staff account payload", () => {
    const result = createUserSchema.safeParse({
      username: "kafe",
      password: "kafe12345",
      role: "STAFF",
      objectId: "abc123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid cashier account payload without an objectId", () => {
    const result = createUserSchema.safeParse({
      username: "kassir",
      password: "kassir123",
      role: "CASHIER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a staff account without an objectId", () => {
    const result = createUserSchema.safeParse({
      username: "kafe",
      password: "kafe12345",
      role: "STAFF",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short username or password", () => {
    expect(
      createUserSchema.safeParse({
        username: "ab",
        password: "kafe12345",
        role: "STAFF",
        objectId: "x",
      }).success,
    ).toBe(false);
    expect(
      createUserSchema.safeParse({
        username: "kafe",
        password: "123",
        role: "STAFF",
        objectId: "x",
      }).success,
    ).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts a valid reset payload", () => {
    expect(
      resetPasswordSchema.safeParse({ userId: "abc", password: "newpass1" }).success,
    ).toBe(true);
  });

  it("rejects a too-short password", () => {
    expect(
      resetPasswordSchema.safeParse({ userId: "abc", password: "short" }).success,
    ).toBe(false);
  });
});

describe("voucherSchema", () => {
  it("accepts a valid voucher payload", () => {
    const result = voucherSchema.safeParse({
      objectId: "abc123",
      guestCount: "4",
      cashAmount: "50000",
      cardAmount: "0",
      transferAmount: "0",
      qrAmount: "0",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a guest count below 1", () => {
    const result = voucherSchema.safeParse({
      objectId: "abc123",
      guestCount: "0",
      cashAmount: "50000",
      cardAmount: "0",
      transferAmount: "0",
      qrAmount: "0",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing objectId", () => {
    const result = voucherSchema.safeParse({
      objectId: "",
      guestCount: "2",
      cashAmount: "50000",
      cardAmount: "0",
      transferAmount: "0",
      qrAmount: "0",
    });
    expect(result.success).toBe(false);
  });
});
