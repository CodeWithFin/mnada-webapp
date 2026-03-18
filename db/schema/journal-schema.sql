-- Journal posts table for Mnada Journal
-- Run this in Supabase SQL editor.

create table if not exists public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  image text,
  tag text,
  date text,
  read_time text,
  is_featured boolean not null default false,
  content text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.journal_posts enable row level security;

-- Policies

-- 1. Everyone can view journal posts
drop policy if exists "Journal posts are viewable by everyone" on public.journal_posts;
create policy "Journal posts are viewable by everyone"
  on public.journal_posts for select
  using (true);

-- 2. Admin can do everything (insert/update/delete)
-- This assumes the admin token/session is verified via service role in the API transition,
-- but for direct DB access let's allow service role.
-- In our API routes, we use supabaseAdmin which bypasses RLS.

-- Trigger for updated_at
drop trigger if exists trg_journal_posts_updated_at on public.journal_posts;
create trigger trg_journal_posts_updated_at
before update on public.journal_posts
for each row
execute function public.set_updated_at();
