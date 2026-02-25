import { createBullet, createJob, deleteBullet, deleteJob, updateBullet, updateJob } from "./actions";
import { createClient } from "@/lib/supabase/server";

type JobRow = {
  id: string;
  company: string;
  role_title: string;
  status: "saved" | "applied" | "interviewing" | "offer" | "rejected" | "archived";
  location: string | null;
  job_url: string | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
};

type BulletRow = {
  id: string;
  category: string;
  bullet: string;
  impact: string | null;
  role_title: string | null;
  company: string | null;
  skills: string[] | null;
  created_at: string;
};

const JOB_STATUSES: JobRow["status"][] = ["saved", "applied", "interviewing", "offer", "rejected", "archived"];

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, company, role_title, status, location, job_url, notes, archived, created_at")
    .order("created_at", { ascending: false });
  const { data: bullets } = await supabase
    .from("bullet_bank")
    .select("id, category, bullet, impact, role_title, company, skills, created_at")
    .order("created_at", { ascending: false });

  const safeJobs = (jobs ?? []) as JobRow[];
  const safeBullets = (bullets ?? []) as BulletRow[];

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12 sm:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Job Tracker</h1>
          <p className="mt-3 text-slate-700">Manage your opportunities in one place{user?.email ? `, ${user.email}` : ""}.</p>
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

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add a job</h2>
        <form action={createJob} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            name="company"
            required
            placeholder="Company"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <input
            name="role_title"
            required
            placeholder="Role title"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <select
            name="status"
            defaultValue="saved"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {JOB_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            name="location"
            placeholder="Location"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <input
            name="job_url"
            type="url"
            placeholder="Job URL"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:col-span-2"
          />
          <textarea
            name="notes"
            placeholder="Notes"
            rows={3}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:col-span-2"
          />
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input type="checkbox" name="archived" className="h-4 w-4" />
            Archived
          </label>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:col-span-2"
          >
            Save job
          </button>
        </form>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Saved jobs</h2>
          <p className="text-sm text-slate-600">{safeJobs.length} total</p>
        </div>

        {safeJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-600">
            No jobs yet. Add your first role above.
          </div>
        ) : (
          <div className="space-y-4">
            {safeJobs.map((job) => (
              <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wide text-slate-500">
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  {job.archived ? <span className="rounded-full bg-slate-100 px-2 py-1">Archived</span> : null}
                </div>

                <form action={updateJob} className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={job.id} />
                  <input
                    name="company"
                    defaultValue={job.company}
                    required
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <input
                    name="role_title"
                    defaultValue={job.role_title}
                    required
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <select
                    name="status"
                    defaultValue={job.status}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    {JOB_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <input
                    name="location"
                    defaultValue={job.location ?? ""}
                    placeholder="Location"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <input
                    name="job_url"
                    type="url"
                    defaultValue={job.job_url ?? ""}
                    placeholder="Job URL"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:col-span-2"
                  />
                  <textarea
                    name="notes"
                    defaultValue={job.notes ?? ""}
                    rows={3}
                    placeholder="Notes"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:col-span-2"
                  />
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
                    <input type="checkbox" name="archived" defaultChecked={job.archived} className="h-4 w-4" />
                    Archived
                  </label>
                  <button
                    type="submit"
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                  >
                    Update
                  </button>
                </form>

                <form action={deleteJob} className="mt-3">
                  <input type="hidden" name="id" value={job.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Bullet bank</h2>
          <p className="text-sm text-slate-600">{safeBullets.length} total</p>
        </div>

        <form action={createBullet} className="grid gap-3 sm:grid-cols-2">
          <input
            name="category"
            placeholder="Category (e.g. leadership)"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <input
            name="skills"
            placeholder="Skills (comma separated)"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <input
            name="role_title"
            placeholder="Related role title"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <input
            name="company"
            placeholder="Related company"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <textarea
            name="bullet"
            required
            rows={3}
            placeholder="Bullet text"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:col-span-2"
          />
          <textarea
            name="impact"
            rows={2}
            placeholder="Impact / outcome (optional)"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:col-span-2"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:col-span-2"
          >
            Save bullet
          </button>
        </form>

        {safeBullets.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-600">
            No bullets yet. Add your strongest accomplishments above.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {safeBullets.map((bullet) => (
              <article key={bullet.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">
                  Added {new Date(bullet.created_at).toLocaleDateString()}
                </div>

                <form action={updateBullet} className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={bullet.id} />
                  <input
                    name="category"
                    defaultValue={bullet.category}
                    placeholder="Category"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <input
                    name="skills"
                    defaultValue={(bullet.skills ?? []).join(", ")}
                    placeholder="Skills (comma separated)"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <input
                    name="role_title"
                    defaultValue={bullet.role_title ?? ""}
                    placeholder="Role title"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <input
                    name="company"
                    defaultValue={bullet.company ?? ""}
                    placeholder="Company"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                  <textarea
                    name="bullet"
                    required
                    defaultValue={bullet.bullet}
                    rows={3}
                    placeholder="Bullet text"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:col-span-2"
                  />
                  <textarea
                    name="impact"
                    defaultValue={bullet.impact ?? ""}
                    rows={2}
                    placeholder="Impact / outcome"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:col-span-2"
                  />
                  <button
                    type="submit"
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                  >
                    Update
                  </button>
                </form>

                <form action={deleteBullet} className="mt-3">
                  <input type="hidden" name="id" value={bullet.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
