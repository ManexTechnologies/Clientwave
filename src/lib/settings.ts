import { z } from "zod";

export const settingsSchema = z.object({
  senderName: z.string().trim().max(120),
  senderEmail: z.string().trim().email().or(z.literal("")),
  dailyLimit: z.coerce.number().int().min(1).max(1000),
  scoreThreshold: z.coerce.number().int().min(0).max(100),
  tone: z.enum(["professional", "friendly", "direct", "playful"]),
  languages: z.array(z.string().trim().min(1).max(40)).min(1).max(10),
  apiKey: z.string().trim().max(500).optional(),
});
