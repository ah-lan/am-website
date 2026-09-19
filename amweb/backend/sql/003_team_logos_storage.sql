-- AM Sports Sprint 2: team logo storage
-- Run after 002_teams.sql.

insert into storage.buckets (id, name, public)
values ('team-logos', 'team-logos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Approved managers can upload team logos" on storage.objects;
create policy "Approved managers can upload team logos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'team-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'manager'
      and status = 'approved'::public.profile_status
  )
);

drop policy if exists "Managers can update their own team logos" on storage.objects;
create policy "Managers can update their own team logos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'team-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'team-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Managers can delete their own team logos" on storage.objects;
create policy "Managers can delete their own team logos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'team-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
