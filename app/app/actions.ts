"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const JOB_STATUSES = ["saved", "applied", "interviewing", "offer", "rejected", "archived"] as const;

type JobStatus = (typeof JOB_STATUSES)[number];

function toOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toJobStatus(value: FormDataEntryValue | null): JobStatus {
  if (typeof value !== "string") {
    return "saved";
  }

  return JOB_STATUSES.includes(value as JobStatus) ? (value as JobStatus) : "saved";
}

function toSkillsArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [] as string[];
  }

  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

export async function createJob(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const company = toOptionalString(formData.get("company"));
  const roleTitle = toOptionalString(formData.get("role_title"));

  if (!company || !roleTitle) {
    return;
  }

  await supabase.from("jobs").insert({
    user_id: user.id,
    company,
    role_title: roleTitle,
    status: toJobStatus(formData.get("status")),
    location: toOptionalString(formData.get("location")),
    job_url: toOptionalString(formData.get("job_url")),
    notes: toOptionalString(formData.get("notes")),
    archived: formData.get("archived") === "on",
  });

  revalidatePath("/app");
}

export async function updateJob(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const id = toOptionalString(formData.get("id"));
  const company = toOptionalString(formData.get("company"));
  const roleTitle = toOptionalString(formData.get("role_title"));

  if (!id || !company || !roleTitle) {
    return;
  }

  await supabase
    .from("jobs")
    .update({
      company,
      role_title: roleTitle,
      status: toJobStatus(formData.get("status")),
      location: toOptionalString(formData.get("location")),
      job_url: toOptionalString(formData.get("job_url")),
      notes: toOptionalString(formData.get("notes")),
      archived: formData.get("archived") === "on",
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/app");
}

export async function deleteJob(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const id = toOptionalString(formData.get("id"));

  if (!id) {
    return;
  }

  await supabase.from("jobs").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/app");
}

export async function createBullet(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const bullet = toOptionalString(formData.get("bullet"));

  if (!bullet) {
    return;
  }

  await supabase.from("bullet_bank").insert({
    user_id: user.id,
    category: toOptionalString(formData.get("category")) ?? "general",
    bullet,
    impact: toOptionalString(formData.get("impact")),
    role_title: toOptionalString(formData.get("role_title")),
    company: toOptionalString(formData.get("company")),
    skills: toSkillsArray(formData.get("skills")),
  });

  revalidatePath("/app");
}

export async function updateBullet(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const id = toOptionalString(formData.get("id"));
  const bullet = toOptionalString(formData.get("bullet"));

  if (!id || !bullet) {
    return;
  }

  await supabase
    .from("bullet_bank")
    .update({
      category: toOptionalString(formData.get("category")) ?? "general",
      bullet,
      impact: toOptionalString(formData.get("impact")),
      role_title: toOptionalString(formData.get("role_title")),
      company: toOptionalString(formData.get("company")),
      skills: toSkillsArray(formData.get("skills")),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/app");
}

export async function deleteBullet(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const id = toOptionalString(formData.get("id"));

  if (!id) {
    return;
  }

  await supabase.from("bullet_bank").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/app");
}
