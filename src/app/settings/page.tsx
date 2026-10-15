import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings-form";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { workspaceId: true, workspace: { select: { name: true } } },
  });
  if (!profile) redirect("/login?error=workspace_missing");

  const settings = await prisma.settings.findUnique({
    where: { workspaceId: profile.workspaceId },
  });
  if (!settings) throw new Error("Workspace settings are missing.");

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-12 sm:px-8">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            ClientWave
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Workspace settings</h1>
          <p className="mt-2 text-slate-600">{profile.workspace.name}</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-white">
            Sign out
          </button>
        </form>
      </header>
      <SettingsForm
        settings={{
          senderName: settings.senderName,
          senderEmail: settings.senderEmail,
          dailyLimit: settings.dailyLimit,
          scoreThreshold: settings.scoreThreshold,
          tone: settings.tone,
          languages: settings.languages,
          hasApiKey: Boolean(settings.encryptedApiKey),
        }}
      />
    </main>
  );
}
