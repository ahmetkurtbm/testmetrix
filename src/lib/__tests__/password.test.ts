import { describe, expect, it } from "vitest";
import { hashPassword, validatePasswordStrength, verifyPassword } from "../password";

describe("validatePasswordStrength", () => {
  it("kısa parolayı reddeder", () => {
    expect(validatePasswordStrength("Ab1defgh")).toMatch(/en az 12/);
  });

  it("büyük harf eksikse reddeder", () => {
    expect(validatePasswordStrength("abcdefgh1234")).toMatch(/büyük harf/);
  });

  it("küçük harf eksikse reddeder", () => {
    expect(validatePasswordStrength("ABCDEFGH1234")).toMatch(/küçük harf/);
  });

  it("rakam eksikse reddeder", () => {
    expect(validatePasswordStrength("AbcdefghIjkl")).toMatch(/rakam/);
  });

  it("çok uzun parolayı reddeder", () => {
    expect(validatePasswordStrength("Aa1" + "b".repeat(130))).toMatch(/128/);
  });

  it("geçerli parolada null döner", () => {
    expect(validatePasswordStrength("GucluParola1")).toBeNull();
  });
});

describe("hashPassword / verifyPassword", () => {
  it("hash'lenen parola doğrulanabilir", async () => {
    const hash = await hashPassword("GucluParola1");
    expect(hash).not.toBe("GucluParola1");
    await expect(verifyPassword("GucluParola1", hash)).resolves.toBe(true);
    await expect(verifyPassword("YanlisParola1", hash)).resolves.toBe(false);
  });

  it("aynı parola her seferinde farklı hash üretir (salt)", async () => {
    const a = await hashPassword("GucluParola1");
    const b = await hashPassword("GucluParola1");
    expect(a).not.toBe(b);
  });
});
