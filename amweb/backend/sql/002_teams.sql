-- AM Sports Sprint 2: team management
-- Run after 001_profiles.sql.

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 80),
  logo_url text,
  founded_year integer check (founded_year between 1800 and extract(year from now())::integer),
  created_at timestamptz not null default now()
);

create index if not exists teams_manager_id_idx on public.teams(manager_id);

alter table public.teams enable row level security;

revoke all on table public.teams from anon;
revoke all on table public.teams from authenticated;
grant select on table public.teams to authenticated;
grant insert, update, delete on table public.teams to authenticated;

drop policy if exists "Authenticated users can view teams" on public.teams;
create policy "Authenticated users can view teams"
on public.teams for select
to authenticated
using (true);

drop policy if exists "Approved managers can create teams" on public.teams;
create policy "Approved managers can create teams"
on public.teams for insert
to authenticated
with check (
  manager_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'manager'
      and status = 'approved'::public.profile_status
  )
);

drop policy if exists "Managers can update their own teams" on public.teams;
create policy "Managers can update their own teams"
on public.teams for update
to authenticated
using (
  manager_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'manager'
      and status = 'approved'::public.profile_status
  )
)
with check (manager_id = (select auth.uid()));

drop policy if exists "Managers can delete their own teams" on public.teams;
create policy "Managers can delete their own teams"
on public.teams for delete
to authenticated
using (manager_id = (select auth.uid()));
