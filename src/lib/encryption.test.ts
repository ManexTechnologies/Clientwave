import { afterEach, describe, expect, it, vi } from "vitest";
import { decryptSecret, encryptSecret } from "@/lib/encryption";

describe("secret encryption", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("encrypts and decrypts a secret with the configured key", () => {
    vi.stubEnv("API_KEY_ENCRYPTION_KEY", "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");

    const encrypted = encryptSecret("private-api-key");

    expect(encrypted).not.toContain("private-api-key");
    expect(decryptSecret(encrypted)).toBe("private-api-key");
  });

  it("rejects keys that are not 32 bytes of hexadecimal data", () => {
    vi.stubEnv("API_KEY_ENCRYPTION_KEY", "not-a-key");

    expect(() => encryptSecret("private-api-key")).toThrow(
      "API_KEY_ENCRYPTION_KEY must be a 32-byte hexadecimal value.",
    );
  });
});
