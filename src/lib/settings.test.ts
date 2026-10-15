import { describe, expect, it } from "vitest";
import { settingsSchema } from "@/lib/settings";

describe("settingsSchema", () => {
  it("accepts workspace settings within configured limits", () => {
    const parsed = settingsSchema.safeParse({
      senderName: "Alex",
      senderEmail: "alex@example.com",
      dailyLimit: "100",
      scoreThreshold: "75",
      tone: "friendly",
      languages: ["English", "French"],
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects out-of-range limits", () => {
    const parsed = settingsSchema.safeParse({
      senderName: "Alex",
      senderEmail: "alex@example.com",
      dailyLimit: "1001",
      scoreThreshold: "-1",
      tone: "friendly",
      languages: ["English"],
    });

    expect(parsed.success).toBe(false);
  });
});
