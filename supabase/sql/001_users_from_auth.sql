-- Best-practice Supabase Auth user sync:
-- 1) Auto-create/update public.users whenever auth.users changes
-- 2) Backfill existing auth users
-- 3) Apply RLS policies for per-user access

create table if not exists public.users (
  id uuid primary key,
  email varchar(255) not null unique,
  display_name varchar(120),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  -- Upgrade legacy public.users shape (e.g. user_id/password_hash) to auth-linked shape.
  alter table public.users add column if not exists id uuid;
  alter table public.users add column if not exists display_name varchar(120);
  alter table public.users add column if not exists avatar_url text;
  alter table public.users add column if not exists created_at timestamptz not null default now();
  alter table public.users add column if not exists updated_at timestamptz not null default now();

  update public.users
  set id = gen_random_uuid()
  where id is null;

  create unique index if not exists users_id_unique_idx on public.users (id);

  -- Legacy custom-auth schemas often keep password_hash as NOT NULL.
  -- Drop that NOT NULL to allow auth-trigger inserts that don't write password_hash.
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'password_hash'
      and is_nullable = 'NO'
  ) then
    alter table public.users alter column password_hash drop not null;
  end if;

  if to_regclass('public.profiles') is not null then
    insert into public.users (id, email, display_name, avatar_url, created_at, updated_at)
    select p.id, p.email, p.display_name, p.avatar_url, p.created_at, p.updated_at
    from public.profiles p
    on conflict (id) do update
    set
      email = excluded.email,
      display_name = coalesce(excluded.display_name, public.users.display_name),
      avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
      updated_at = now();
  end if;
end
$$;

create or replace function public.sync_user_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    display_name,
    avatar_url,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'userName',
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name'
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    now(),
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.users.display_name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.sync_user_from_auth_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_user_from_auth_user();

create or replace function public.delete_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.users where id = old.id;
  return old;
end;
$$;

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
after delete on auth.users
for each row execute function public.delete_user();

insert into public.users (id, email, created_at, updated_at)
select au.id, au.email, now(), now()
from auth.users au
left join public.users u on u.id = au.id
where u.id is null
  and au.email is not null;

alter table public.users enable row level security;

drop policy if exists users_select_own on public.users;
create policy users_select_own
on public.users
for select
using (auth.uid() = id);

drop policy if exists users_insert_own on public.users;
create policy users_insert_own
on public.users
for insert
with check (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);
