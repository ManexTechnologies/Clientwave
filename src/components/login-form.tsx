"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ initialError = "" }: { initialError?: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(initialError);
  const [busy, setBusy] = useState(false);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    setMessage(error ? error.message : "Check your email for a secure sign-in link.");
  }

  async function signInWithGoogle() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setBusy(false);
      setMessage(error.message);
    }
  }

  return (
    <div className="mt-7 space-y-5">
      <button
        className="w-full rounded-lg border px-4 py-3 font-medium hover:bg-slate-50 disabled:opacity-60"
        disabled={busy}
        onClick={signInWithGoogle}
        type="button"
      >
        Continue with Google
      </button>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        OR
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <form className="space-y-3" onSubmit={sendMagicLink}>
        <label className="block text-sm font-medium" htmlFor="email">
          Work email
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-lg border px-3 py-2.5"
          id="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <button
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={busy}
          type="submit"
        >
          Email me a sign-in link
        </button>
      </form>
      {message && (
        <p aria-live="polite" className="text-sm text-slate-600">
          {message}
        </p>
      )}
    </div>
  );
}
