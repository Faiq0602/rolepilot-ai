"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  nextPath: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const onEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingEmail(true);
    setMessage(null);

    const redirectTo =
      typeof window === "undefined"
        ? undefined
        : `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setMessage("Unable to send sign-in link. Check configuration and try again.");
    } else {
      setMessage("Check your email for a secure sign-in link.");
    }

    setLoadingEmail(false);
  };

  const onGoogleLogin = async () => {
    setLoadingGoogle(true);
    setMessage(null);

    const redirectTo =
      typeof window === "undefined"
        ? undefined
        : `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setMessage("Google sign-in failed. Check provider settings and try again.");
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to RolePilot AI</h1>
      <p className="mt-2 text-sm text-slate-600">Use Google or an email magic link.</p>

      <button
        type="button"
        onClick={onGoogleLogin}
        disabled={loadingGoogle}
        className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loadingGoogle ? "Redirecting..." : "Continue with Google"}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
        <span className="h-px flex-1 bg-slate-200" />
        Or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={onEmailLogin} className="space-y-3">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          placeholder="you@example.com"
        />
        <button
          type="submit"
          disabled={loadingEmail}
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loadingEmail ? "Sending link..." : "Send magic link"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
