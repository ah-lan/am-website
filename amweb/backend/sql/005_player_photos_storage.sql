-- AM Sports Sprint 3: player photo storage
-- Run after 004_players.sql.

insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Approved managers can upload player photos" on storage.objects;
create policy "Approved managers can upload player photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'player-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'manager'
      and status = 'approved'::public.profile_status
  )
);

drop policy if exists "Managers can update their own player photos" on storage.objects;
create policy "Managers can update their own player photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'player-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'player-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Managers can delete their own player photos" on storage.objects;
create policy "Managers can delete their own player photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'player-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
