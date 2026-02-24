import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-12 sm:px-10">
      <div className="mb-8 inline-flex w-fit rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
        RolePilot AI
      </div>
      <section className="grid gap-8 rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur sm:p-12">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Your AI co-pilot for job applications.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
          Track roles, organize your bullet bank, and generate tailored resume versions per job with reliable
          fallbacks so your demo stays stable.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/app"
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open App
          </Link>
          <span className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700">
            Next.js + Supabase + Gemini
          </span>
        </div>
      </section>
    </main>
  );
}
