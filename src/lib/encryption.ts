import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function getEncryptionKey(): Buffer {
  const value = process.env.API_KEY_ENCRYPTION_KEY;
  if (!value || !/^[\da-f]{64}$/i.test(value)) {
    throw new Error("API_KEY_ENCRYPTION_KEY must be a 32-byte hexadecimal value.");
  }
  return Buffer.from(value, "hex");
}

export function encryptSecret(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64")).join(".");
}

export function decryptSecret(value: string): string {
  const [ivValue, tagValue, encryptedValue] = value.split(".");
  if (!ivValue || !tagValue || !encryptedValue) {
    throw new Error("Stored encrypted secret has an invalid format.");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivValue, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
