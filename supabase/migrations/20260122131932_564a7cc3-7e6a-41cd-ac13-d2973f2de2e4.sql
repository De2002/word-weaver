-- Fix: Postgres does not support CREATE POLICY IF NOT EXISTS.

-- 1) Helper: updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Roles (CRITICAL: roles in separate table)
do $$ begin
  create type public.app_role as enum ('user','poet','moderator','admin');
exception when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Policies (create only if missing)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_roles' and policyname='Users can view own roles') then
    execute 'create policy "Users can view own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_roles' and policyname='Users can self-assign poet role') then
    execute 'create policy "Users can self-assign poet role" on public.user_roles for insert to authenticated with check (auth.uid() = user_id and role in (''poet'',''user''))';
  end if;
end $$;

-- 3) Profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Trigger (create only if missing)
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'update_profiles_updated_at'
  ) then
    execute 'create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column()';
  end if;
end $$;

-- Policies
 do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can view own profile') then
    execute 'create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can insert own profile') then
    execute 'create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can update own profile') then
    execute 'create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = user_id)';
  end if;
end $$;

-- 4) Poems
 do $$ begin
  create type public.poem_status as enum ('draft','published');
exception when duplicate_object then null;
end $$;

create table if not exists public.poems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null,
  tags text[] not null default '{}',
  status public.poem_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.poems enable row level security;

create index if not exists idx_poems_user_id on public.poems(user_id);
create index if not exists idx_poems_status on public.poems(status);
create index if not exists idx_poems_tags on public.poems using gin(tags);

-- Trigger
 do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'update_poems_updated_at') then
    execute 'create trigger update_poems_updated_at before update on public.poems for each row execute function public.update_updated_at_column()';
  end if;
end $$;

-- Policies
 do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='poems' and policyname='Read published poems or own drafts') then
    execute 'create policy "Read published poems or own drafts" on public.poems for select to authenticated using (status = ''published'' or auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='poems' and policyname='Poets can create poems') then
    execute 'create policy "Poets can create poems" on public.poems for insert to authenticated with check (auth.uid() = user_id and public.has_role(auth.uid(), ''poet''))';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='poems' and policyname='Owners can update poems') then
    execute 'create policy "Owners can update poems" on public.poems for update to authenticated using (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='poems' and policyname='Owners can delete poems') then
    execute 'create policy "Owners can delete poems" on public.poems for delete to authenticated using (auth.uid() = user_id)';
  end if;
end $$;

-- 5) Poem audio references (no binary in DB)
create table if not exists public.poem_audio_files (
  id uuid primary key default gen_random_uuid(),
  poem_id uuid not null references public.poems(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique(poem_id)
);

alter table public.poem_audio_files enable row level security;

create index if not exists idx_poem_audio_user_id on public.poem_audio_files(user_id);

-- Policies
 do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='poem_audio_files' and policyname='Owners can read own poem audio') then
    execute 'create policy "Owners can read own poem audio" on public.poem_audio_files for select to authenticated using (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='poem_audio_files' and policyname='Owners can attach audio to own poem') then
    execute 'create policy "Owners can attach audio to own poem" on public.poem_audio_files for insert to authenticated with check (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='poem_audio_files' and policyname='Owners can update own poem audio') then
    execute 'create policy "Owners can update own poem audio" on public.poem_audio_files for update to authenticated using (auth.uid() = user_id)';
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='poem_audio_files' and policyname='Owners can delete own poem audio') then
    execute 'create policy "Owners can delete own poem audio" on public.poem_audio_files for delete to authenticated using (auth.uid() = user_id)';
  end if;
end $$;

-- 6) Storage bucket for poem audio (private)
insert into storage.buckets (id, name, public)
values ('poem-audio', 'poem-audio', false)
on conflict (id) do nothing;

-- Storage policies (create only if missing)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Poem audio: owner can read') then
    execute 'create policy "Poem audio: owner can read" on storage.objects for select to authenticated using (bucket_id = ''poem-audio'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Poem audio: owner can upload') then
    execute 'create policy "Poem audio: owner can upload" on storage.objects for insert to authenticated with check (bucket_id = ''poem-audio'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Poem audio: owner can update') then
    execute 'create policy "Poem audio: owner can update" on storage.objects for update to authenticated using (bucket_id = ''poem-audio'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Poem audio: owner can delete') then
    execute 'create policy "Poem audio: owner can delete" on storage.objects for delete to authenticated using (bucket_id = ''poem-audio'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
end $$;
