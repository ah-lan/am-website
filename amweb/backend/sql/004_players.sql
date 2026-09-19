-- AM Sports Sprint 3: player roster management
-- Run after 002_teams.sql.

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 80),
  position text not null check (position in ('GK', 'DEF', 'MID', 'FWD')),
  jersey_number integer not null check (jersey_number between 1 and 99),
  photo_url text,
  created_at timestamptz not null default now(),
  unique (team_id, jersey_number)
);

create index if not exists players_team_id_idx on public.players(team_id);

alter table public.players enable row level security;

revoke all on table public.players from anon;
revoke all on table public.players from authenticated;
grant select on table public.players to authenticated;
grant insert, update, delete on table public.players to authenticated;

drop policy if exists "Authenticated users can view players" on public.players;
create policy "Authenticated users can view players"
on public.players for select
to authenticated
using (true);

drop policy if exists "Approved managers can add players" on public.players;
create policy "Approved managers can add players"
on public.players for insert
to authenticated
with check (
  exists (
    select 1
    from public.teams t
    join public.profiles p on p.id = t.manager_id
    where t.id = team_id
      and t.manager_id = (select auth.uid())
      and p.role = 'manager'
      and p.status = 'approved'::public.profile_status
  )
);

drop policy if exists "Approved managers can update players" on public.players;
create policy "Approved managers can update players"
on public.players for update
to authenticated
using (
  exists (
    select 1
    from public.teams t
    join public.profiles p on p.id = t.manager_id
    where t.id = players.team_id
      and t.manager_id = (select auth.uid())
      and p.role = 'manager'
      and p.status = 'approved'::public.profile_status
  )
)
with check (
  exists (
    select 1
    from public.teams t
    join public.profiles p on p.id = t.manager_id
    where t.id = players.team_id
      and t.manager_id = (select auth.uid())
      and p.role = 'manager'
      and p.status = 'approved'::public.profile_status
  )
);

drop policy if exists "Approved managers can delete players" on public.players;
create policy "Approved managers can delete players"
on public.players for delete
to authenticated
using (
  exists (
    select 1
    from public.teams t
    join public.profiles p on p.id = t.manager_id
    where t.id = players.team_id
      and t.manager_id = (select auth.uid())
      and p.role = 'manager'
      and p.status = 'approved'::public.profile_status
  )
);
