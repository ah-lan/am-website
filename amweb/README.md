This is a [Next.js](https://nextjs.org) AM Sports web app with Supabase email/password authentication.

## Sprint 1 implementation

Sprint 1 authentication and dashboard work is implemented:

- Supabase email/password sign-up and sign-in
- Signup fields for name, phone, role, password and password confirmation
- Player and turf manager role selection using `player` and `manager` values
- Email confirmation callback at `/auth/callback`
- Profile updates for `phone` and `role` after authentication
- Database-triggered profile creation owns `id`, `name`, `phone`, `role`, and manager approval status
- Protected dashboard behavior that redirects unauthenticated users to sign-in
- Role-aware dashboard content based on `profiles.role`
- Real profile name and avatar initials loaded from Supabase
- Sign-out through the profile menu and desktop sidebar
- Responsive desktop and mobile dashboard shells
- Turquoise AM Sports visual system with larger desktop typography

The dashboard currently uses designed sample content for player and manager sections. Live booking, pitch, team, messaging, and admin data modules are planned for later sprints.

Sprint 2 team management is now available at `/teams`. Run `backend/sql/002_teams.sql` and `backend/sql/003_team_logos_storage.sql` before using live team creation. Approved managers can create and delete their own teams and upload team logos; authenticated users can view the team list.

## Supabase authentication setup

1. Copy `.env.local.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. In Supabase, add these Auth redirect URLs:

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
https://your-production-domain.com/auth/callback
https://your-production-domain.com/auth/reset-password
```

3. Enable email confirmation for the current signup flow. Users confirm their email through the `/auth/callback` route before entering the dashboard.

The signup form sends the display name, phone, and role as Auth metadata. The database trigger in `backend/sql/001_profiles.sql` creates the complete `profiles` row; the browser does not insert or update profiles after signup. It never controls `id`, `status`, or `avatar_url`.

Password recovery is available at `/auth/forgot-password`. Supabase sends a recovery email and returns the user to `/auth/reset-password`, where they can set and confirm a new password.

## Backend SQL

Database commands live in [`backend/sql`](backend/sql). Run migrations in filename order in the Supabase SQL Editor. See [`backend/README.md`](backend/README.md) for the backend workflow.
