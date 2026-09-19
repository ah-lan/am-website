# AM Sports backend SQL

This folder contains database migrations for Supabase. Run the files in `sql/` in filename order using the Supabase SQL Editor or your migration workflow.

## Sprint 1

`sql/001_profiles.sql` creates the `profiles` table, the Auth signup trigger, and owner-scoped Row Level Security policies.

The trigger reads `name`, `phone`, and `role` from Supabase Auth user metadata. It creates managers with `status = 'pending'` and players with `status = 'approved'`. The frontend must not insert into `profiles` or update profile fields after signup.

Never commit Supabase service-role keys or other secrets. The trigger runs with database privileges through `security definer`; its `search_path` is fixed to `public`.
