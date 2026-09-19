-- AM Sports Sprint 1: profiles and Auth signup trigger
-- Run this migration in the Supabase SQL Editor.

do $$
begin
  create type public.profile_status as enum ('pending', 'approved', 'suspended');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  role text not null default 'player' check (role in ('player', 'manager', 'admin')),
  status public.profile_status not null default 'approved'::public.profile_status,
  avatar_url text,
  created_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'status'
      and data_type = 'text'
  ) then
    alter table public.profiles drop constraint if exists profiles_status_check;
    alter table public.profiles alter column status drop default;
    alter table public.profiles
      alter column status type public.profile_status
      using status::text::public.profile_status;
    alter table public.profiles
      alter column status set default 'approved'::public.profile_status;
  end if;
end
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text := coalesce(new.raw_user_meta_data ->> 'role', 'player');
begin
  if user_role not in ('player', 'manager', 'admin') then
    user_role := 'player';
  end if;

  insert into public.profiles (id, name, phone, role, status)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1), 'AM Sports user'),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    user_role,
    case when user_role = 'manager' then 'pending' else 'approved' end::public.profile_status
  )
  on conflict (id) do update set
    name = excluded.name,
    phone = excluded.phone,
    role = excluded.role,
    status = case
      when excluded.role = 'manager' then 'pending'::public.profile_status
      else public.profiles.status
    end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (phone, role) on table public.profiles to authenticated;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update their own contact details" on public.profiles;
create policy "Users can update their own contact details"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
