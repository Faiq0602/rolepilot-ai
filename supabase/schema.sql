-- RolePilot AI PR2: Core schema + RLS
-- Run this whole file in Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- Keep updated_at consistent across mutable tables.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  headline text,
  location text,
  years_experience integer check (years_experience is null or years_experience >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null,
  role_title text not null,
  job_url text,
  source text,
  status text not null default 'saved' check (status in ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'archived')),
  location text,
  compensation_text text,
  description text,
  notes text,
  applied_at date,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bullet_bank (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null default 'general',
  bullet text not null,
  impact text,
  role_title text,
  company text,
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_user_id_created_at_idx
  on public.jobs (user_id, created_at desc);

create index if not exists jobs_user_id_status_idx
  on public.jobs (user_id, status);

create index if not exists bullet_bank_user_id_created_at_idx
  on public.bullet_bank (user_id, created_at desc);

create index if not exists bullet_bank_skills_gin_idx
  on public.bullet_bank using gin (skills);

-- Triggers

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_bullet_bank_updated_at on public.bullet_bank;
create trigger set_bullet_bank_updated_at
before update on public.bullet_bank
for each row execute function public.set_updated_at();

-- Automatically create a profile row for each new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Row-level security
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.bullet_bank enable row level security;

-- Profiles policies

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using (auth.uid() = id);

-- Jobs policies

drop policy if exists "jobs_select_own" on public.jobs;
create policy "jobs_select_own"
on public.jobs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "jobs_insert_own" on public.jobs;
create policy "jobs_insert_own"
on public.jobs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "jobs_update_own" on public.jobs;
create policy "jobs_update_own"
on public.jobs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "jobs_delete_own" on public.jobs;
create policy "jobs_delete_own"
on public.jobs
for delete
to authenticated
using (auth.uid() = user_id);

-- Bullet bank policies

drop policy if exists "bullet_bank_select_own" on public.bullet_bank;
create policy "bullet_bank_select_own"
on public.bullet_bank
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "bullet_bank_insert_own" on public.bullet_bank;
create policy "bullet_bank_insert_own"
on public.bullet_bank
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "bullet_bank_update_own" on public.bullet_bank;
create policy "bullet_bank_update_own"
on public.bullet_bank
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "bullet_bank_delete_own" on public.bullet_bank;
create policy "bullet_bank_delete_own"
on public.bullet_bank
for delete
to authenticated
using (auth.uid() = user_id);

-- Helpful verification queries to run manually after applying:
-- select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename in ('profiles', 'jobs', 'bullet_bank');
-- select policyname, tablename, cmd from pg_policies where schemaname = 'public' and tablename in ('profiles', 'jobs', 'bullet_bank') order by tablename, policyname;
