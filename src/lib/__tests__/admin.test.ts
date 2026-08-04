import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

/**
 * `ADMIN_EMAILS` modül yüklenirken bir kez okunduğu için (top-level const),
 * her senaryoda `vi.resetModules()` + dinamik `import()` ile modülü env
 * değişkeni ayarlandıktan SONRA yeniden yüklüyoruz.
 */
describe("isAdminEmail", () => {
  const original = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = original;
  });

  it("listedeki e-postayı büyük/küçük harf duyarsız eşleştirir", async () => {
    process.env.ADMIN_EMAILS = "admin@example.com, other@example.com";
    const { isAdminEmail } = await import("../admin");
    expect(isAdminEmail("ADMIN@example.com")).toBe(true);
    expect(isAdminEmail("other@example.com")).toBe(true);
  });

  it("listede olmayan e-postayı reddeder", async () => {
    process.env.ADMIN_EMAILS = "admin@example.com";
    const { isAdminEmail } = await import("../admin");
    expect(isAdminEmail("random@example.com")).toBe(false);
  });

  it("liste boşsa kimseyi kabul etmez", async () => {
    process.env.ADMIN_EMAILS = "";
    const { isAdminEmail } = await import("../admin");
    expect(isAdminEmail("admin@example.com")).toBe(false);
  });

  it("null/undefined e-postayı reddeder", async () => {
    process.env.ADMIN_EMAILS = "admin@example.com";
    const { isAdminEmail } = await import("../admin");
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });
});
