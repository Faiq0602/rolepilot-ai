import { createClient } from "@/lib/supabase/server";

export default async function AppPlaceholderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 sm:px-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">RolePilot App</h1>
          <p className="mt-3 text-slate-700">
            Welcome back{user?.email ? `, ${user.email}` : ""}. Jobs tracking, bullet bank, and tailoring tools are
            coming next.
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
