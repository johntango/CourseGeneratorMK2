-- STEP 0: Authorization & Identity bootstrap
-- Safe to run multiple times (guards included).

create extension if not exists pgcrypto;

-- Profiles: durable roles & user metadata
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  org text,
  global_role text not null default 'student' check (global_role in ('student','instructor','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists t_profiles_uat on public.profiles;
create trigger t_profiles_uat before update on public.profiles
for each row execute function public.set_updated_at();

-- On first sign-in, materialize a profile row
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1))
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Role helpers (stable; used by RLS)
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.global_role = 'admin'
  );
$$;

create or replace function public.is_instructor_global()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.global_role in ('instructor','admin')
  );
$$;

-- One-time admin bootstrap (service role only)
create or replace function public.promote_admin(target_email text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  uid uuid;
begin
  select id into uid from auth.users where email = target_email limit 1;
  if uid is null then
    raise exception 'User with email % not found in auth.users', target_email;
  end if;

  insert into public.profiles(user_id, email, global_role)
  values (uid, target_email, 'admin')
  on conflict (user_id) do update set global_role = excluded.global_role;
end;
$$;

revoke all on function public.promote_admin(text) from public;

-- RLS: private-by-default with self-read/edit and admin read/edit
alter table public.profiles enable row level security;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
for update using (public.is_admin()) with check (public.is_admin());
