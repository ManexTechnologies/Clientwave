"use server";

import { revalidatePath } from "next/cache";
import { encryptSecret } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { settingsSchema } from "@/lib/settings";

export type SettingsActionState = { status: "idle" | "success" | "error"; message: string };

export async function saveSettings(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in again to save settings." };

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { workspaceId: true },
  });
  if (!profile) return { status: "error", message: "Your workspace could not be found." };

  const parsed = settingsSchema.safeParse({
    senderName: formData.get("senderName"),
    senderEmail: formData.get("senderEmail"),
    dailyLimit: formData.get("dailyLimit"),
    scoreThreshold: formData.get("scoreThreshold"),
    tone: formData.get("tone"),
    languages: String(formData.get("languages") ?? "")
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean),
    apiKey: formData.get("apiKey") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid settings." };
  }

  const existing = await prisma.settings.findUnique({
    where: { workspaceId: profile.workspaceId },
    select: { encryptedApiKey: true },
  });
  if (!existing) return { status: "error", message: "Workspace settings are missing." };

  const { apiKey, ...settings } = parsed.data;
  const encryptedApiKey = apiKey ? encryptSecret(apiKey) : existing.encryptedApiKey;
  await prisma.settings.update({
    where: { workspaceId: profile.workspaceId },
    data: { ...settings, encryptedApiKey },
  });
  await prisma.auditLog.create({
    data: {
      workspaceId: profile.workspaceId,
      actorUserId: user.id,
      action: "settings.updated",
      entity: "settings",
    },
  });
  revalidatePath("/settings");
  return { status: "success", message: "Settings saved." };
}
