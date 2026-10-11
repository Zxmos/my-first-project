-- ERecPass schema aligned to the newer uploaded app's Supabase helper calls.
-- Run in Supabase SQL Editor. This does not migrate old localStorage demo data.
create table if not exists public.patients (
  id text primary key,
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  full_name text,
  email text,
  sim text,
  photo text,
  age_category text,
  guardian_num text,
  status text not null default 'Green',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id bigint primary key,
  patient_id text not null,
  patient_name text not null,
  doctor text,
  appointment_date date,
  reason text,
  status text not null default 'Pending Approval',
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete cascade
);

alter table public.patients enable row level security;
alter table public.appointments enable row level security;

-- Patient can read/update only their own linked patient row.
drop policy if exists "patient reads own profile" on public.patients;
create policy "patient reads own profile" on public.patients for select to authenticated using (auth_user_id = auth.uid());
drop policy if exists "patient updates own profile" on public.patients;
create policy "patient updates own profile" on public.patients for update to authenticated using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

-- Appointments are scoped by authenticated user_id. The app must include user_id on writes.
drop policy if exists "users read own appointments" on public.appointments;
create policy "users read own appointments" on public.appointments for select to authenticated using (user_id = auth.uid());
drop policy if exists "users insert own appointments" on public.appointments;
create policy "users insert own appointments" on public.appointments for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "users update own appointments" on public.appointments;
create policy "users update own appointments" on public.appointments for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "users delete own appointments" on public.appointments;
create policy "users delete own appointments" on public.appointments for delete to authenticated using (user_id = auth.uid());
