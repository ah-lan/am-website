# AM Sports backend SQL

This folder contains database migrations for Supabase. Run the files in `sql/` in filename order using the Supabase SQL Editor or your migration workflow.

## Sprint 1

`sql/001_profiles.sql` creates the `profiles` table, the Auth signup trigger, and owner-scoped Row Level Security policies.

The trigger reads `name`, `phone`, and `role` from Supabase Auth user metadata. It creates managers with `status = 'pending'` and players with `status = 'approved'`. The frontend must not insert into `profiles` or update profile fields after signup.

Never commit Supabase service-role keys or other secrets. The trigger runs with database privileges through `security definer`; its `search_path` is fixed to `public`.

## Sprint 2

`sql/002_teams.sql` creates the `teams` table and RLS policies. Authenticated users can view teams. Only managers with `profiles.role = 'manager'` and `profiles.status = 'approved'` can create teams. Managers can update or delete only teams they own.

`sql/003_team_logos_storage.sql` creates the public `team-logos` Storage bucket and owner-scoped upload/update/delete policies. The app stores uploads at `{authenticated-user-id}/{generated-file-name}` and accepts JPG, PNG, and WebP files up to 5 MB.

## Sprint 3

`sql/004_players.sql` creates the roster table with position and jersey validation. Authenticated users can view players; only approved managers can add, update, or remove players from teams they own. The roster UI is available at `/players`.

`sql/005_player_photos_storage.sql` creates the public `player-photos` bucket and owner-scoped policies. Player images use the same JPG, PNG, and WebP format rules and 5 MB client limit as team logos.
