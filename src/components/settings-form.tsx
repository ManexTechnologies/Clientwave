"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsActionState } from "@/app/settings/actions";

type SettingsFormProps = {
  settings: {
    senderName: string;
    senderEmail: string;
    dailyLimit: number;
    scoreThreshold: number;
    tone: string;
    languages: string[];
    hasApiKey: boolean;
  };
};

const initialState: SettingsActionState = { status: "idle", message: "" };
const inputClass =
  "mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(saveSettings, initialState);

  return (
    <form action={formAction} className="space-y-8 rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
      <section>
        <h2 className="text-lg font-semibold">Sender profile</h2>
        <p className="mt-1 text-sm text-slate-600">The identity used in your client outreach.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Sender name
            <input className={inputClass} defaultValue={settings.senderName} maxLength={120} name="senderName" required />
          </label>
          <label className="text-sm font-medium">
            Sender email
            <input className={inputClass} defaultValue={settings.senderEmail} name="senderEmail" type="email" />
          </label>
        </div>
      </section>
      <section className="border-t pt-7">
        <h2 className="text-lg font-semibold">Outreach preferences</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Daily send limit
            <input className={inputClass} defaultValue={settings.dailyLimit} max="1000" min="1" name="dailyLimit" required type="number" />
          </label>
          <label className="text-sm font-medium">
            Lead score threshold
            <input className={inputClass} defaultValue={settings.scoreThreshold} max="100" min="0" name="scoreThreshold" required type="number" />
          </label>
          <label className="text-sm font-medium">
            Writing tone
            <select className={inputClass} defaultValue={settings.tone} name="tone">
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="direct">Direct</option>
              <option value="playful">Playful</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Languages
            <input
              className={inputClass}
              defaultValue={settings.languages.join(", ")}
              name="languages"
              placeholder="English, French"
              required
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">Separate languages with commas.</span>
          </label>
        </div>
      </section>
      <section className="border-t pt-7">
        <h2 className="text-lg font-semibold">API credentials</h2>
        <p className="mt-1 text-sm text-slate-600">
          Stored encrypted with AES-256-GCM. The value is never displayed after saving.
        </p>
        <label className="mt-5 block text-sm font-medium">
          API key {settings.hasApiKey && <span className="font-normal text-emerald-700">(key stored)</span>}
          <input
            autoComplete="new-password"
            className={inputClass}
            name="apiKey"
            placeholder={settings.hasApiKey ? "Leave blank to keep the current key" : "Paste a key"}
            type="password"
          />
        </label>
      </section>
      <div className="flex flex-wrap items-center gap-4 border-t pt-6">
        <button
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving..." : "Save settings"}
        </button>
        {state.message && (
          <p
            aria-live="polite"
            className={state.status === "error" ? "text-sm text-red-700" : "text-sm text-emerald-700"}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
