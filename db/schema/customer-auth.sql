-- Customer auth/profile schema for Supabase (PostgreSQL)
-- Run this in Supabase SQL editor.

create extension if not exists pgcrypto;

-- 1) Profile table keyed by auth.users.id
create table if not exists public.customer_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  phone text,
  phone_normalized text,
  first_name text,
  last_name text,
  auth_provider text,
  signup_at timestamptz not null default now(),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customer_profiles_phone_normalized_key
  on public.customer_profiles (phone_normalized)
  where phone_normalized is not null and phone_normalized <> '';

create index if not exists customer_profiles_email_idx
  on public.customer_profiles (lower(email));

-- 2) Auth event log (signup/login/logout)
create table if not exists public.customer_auth_events (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null check (event_type in ('signup', 'login', 'logout', 'profile_update')),
  auth_provider text,
  occurred_at timestamptz not null default now(),
  raw_user_meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists customer_auth_events_user_id_idx
  on public.customer_auth_events (user_id, occurred_at desc);

-- 3) Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_customer_profiles_updated_at on public.customer_profiles;
create trigger trg_customer_profiles_updated_at
before update on public.customer_profiles
for each row
execute function public.set_updated_at();

-- 4) Keep profile + signup event in sync when a new auth user is created
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provider text;
  f_name text;
  l_name text;
  normalized_phone text;
begin
  provider := coalesce(new.raw_app_meta_data ->> 'provider', 'unknown');
  f_name := coalesce(new.raw_user_meta_data ->> 'firstName', new.raw_user_meta_data ->> 'given_name');
  l_name := coalesce(new.raw_user_meta_data ->> 'lastName', new.raw_user_meta_data ->> 'family_name');

  if new.phone is not null then
    normalized_phone := regexp_replace(new.phone, '\D', '', 'g');
    if normalized_phone like '0%' then
      normalized_phone := '254' || substr(normalized_phone, 2);
    end if;
  end if;

  insert into public.customer_profiles (
    id,
    email,
    phone,
    phone_normalized,
    first_name,
    last_name,
    auth_provider,
    signup_at,
    last_login_at
  )
  values (
    new.id,
    new.email,
    new.phone,
    nullif(normalized_phone, ''),
    nullif(f_name, ''),
    nullif(l_name, ''),
    provider,
    coalesce(new.created_at, now()),
    coalesce(new.last_sign_in_at, now())
  )
  on conflict (id) do update
  set
    email = excluded.email,
    phone = excluded.phone,
    phone_normalized = excluded.phone_normalized,
    first_name = coalesce(excluded.first_name, public.customer_profiles.first_name),
    last_name = coalesce(excluded.last_name, public.customer_profiles.last_name),
    auth_provider = excluded.auth_provider,
    last_login_at = excluded.last_login_at;

  insert into public.customer_auth_events (
    user_id,
    event_type,
    auth_provider,
    occurred_at,
    raw_user_meta
  )
  values (
    new.id,
    'signup',
    provider,
    coalesce(new.created_at, now()),
    new.raw_user_meta_data
  );

  return new;
end;
$$;

-- 5) Track logins and metadata changes when auth.users is updated
create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provider text;
  f_name text;
  l_name text;
  normalized_phone text;
begin
  provider := coalesce(new.raw_app_meta_data ->> 'provider', 'unknown');
  f_name := coalesce(new.raw_user_meta_data ->> 'firstName', new.raw_user_meta_data ->> 'given_name');
  l_name := coalesce(new.raw_user_meta_data ->> 'lastName', new.raw_user_meta_data ->> 'family_name');

  if new.phone is not null then
    normalized_phone := regexp_replace(new.phone, '\D', '', 'g');
    if normalized_phone like '0%' then
      normalized_phone := '254' || substr(normalized_phone, 2);
    end if;
  end if;

  insert into public.customer_profiles (
    id,
    email,
    phone,
    phone_normalized,
    first_name,
    last_name,
    auth_provider,
    signup_at,
    last_login_at
  )
  values (
    new.id,
    new.email,
    new.phone,
    nullif(normalized_phone, ''),
    nullif(f_name, ''),
    nullif(l_name, ''),
    provider,
    coalesce(new.created_at, now()),
    new.last_sign_in_at
  )
  on conflict (id) do update
  set
    email = excluded.email,
    phone = excluded.phone,
    phone_normalized = excluded.phone_normalized,
    first_name = coalesce(excluded.first_name, public.customer_profiles.first_name),
    last_name = coalesce(excluded.last_name, public.customer_profiles.last_name),
    auth_provider = excluded.auth_provider,
    last_login_at = coalesce(excluded.last_login_at, public.customer_profiles.last_login_at);

  -- Login event: when last_sign_in_at changes
  if new.last_sign_in_at is distinct from old.last_sign_in_at and new.last_sign_in_at is not null then
    insert into public.customer_auth_events (
      user_id,
      event_type,
      auth_provider,
      occurred_at,
      raw_user_meta
    )
    values (
      new.id,
      'login',
      provider,
      new.last_sign_in_at,
      new.raw_user_meta_data
    );
  elsif new.raw_user_meta_data is distinct from old.raw_user_meta_data then
    insert into public.customer_auth_events (
      user_id,
      event_type,
      auth_provider,
      occurred_at,
      raw_user_meta
    )
    values (
      new.id,
      'profile_update',
      provider,
      now(),
      new.raw_user_meta_data
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_auth_user_created on auth.users;
create trigger trg_auth_user_created
after insert on auth.users
for each row
execute function public.handle_auth_user_created();

drop trigger if exists trg_auth_user_updated on auth.users;
create trigger trg_auth_user_updated
after update on auth.users
for each row
execute function public.handle_auth_user_updated();

-- 6) Row level security policies
alter table public.customer_profiles enable row level security;
alter table public.customer_auth_events enable row level security;

-- Profiles: a user can read/update only their own profile.
drop policy if exists customer_profiles_select_own on public.customer_profiles;
create policy customer_profiles_select_own
  on public.customer_profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists customer_profiles_update_own on public.customer_profiles;
create policy customer_profiles_update_own
  on public.customer_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Optional: allow users to insert their own row (usually handled by triggers/service role).
drop policy if exists customer_profiles_insert_own on public.customer_profiles;
create policy customer_profiles_insert_own
  on public.customer_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Auth events: users can only read their own events.
drop policy if exists customer_auth_events_select_own on public.customer_auth_events;
create policy customer_auth_events_select_own
  on public.customer_auth_events
  for select
  to authenticated
  using (auth.uid() = user_id);

-- No direct insert/update/delete policy for authenticated users on events.
-- Inserts should happen from triggers/service role only.
