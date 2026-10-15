import { LoginForm } from "@/components/login-form";

const callbackErrors: Record<string, string> = {
  missing_code: "The sign-in link is missing its authentication code. Please try again.",
  auth_callback: "We couldn't complete sign-in. Please request a new link and try again.",
  missing_user: "Your account details were unavailable. Please try signing in again.",
  workspace_missing: "Your workspace could not be loaded. Please sign in again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">ClientWave</p>
        <h1 className="mt-5 text-2xl font-semibold">Sign in to your workspace</h1>
        <p className="mt-2 text-sm text-slate-600">
          Continue with Google or receive a secure sign-in link by email.
        </p>
        <LoginForm initialError={error ? callbackErrors[error] ?? "Sign-in could not be completed." : ""} />
      </div>
    </main>
  );
}
