import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/settings");

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">ClientWave</p>
      <h1 className="mt-5 max-w-2xl text-5xl font-semibold tracking-tight">
        Make every client conversation count.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-slate-600">
        A focused workspace for planning and personalizing your outreach.
      </p>
      <Link
        className="mt-8 w-fit rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        href="/login"
      >
        Get started
      </Link>
    </main>
  );
}
