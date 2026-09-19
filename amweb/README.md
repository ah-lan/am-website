This is a [Next.js](https://nextjs.org) AM Sports web app with Supabase email/password authentication.

## Sprint 1 implementation

Sprint 1 authentication and dashboard work is implemented:

- Supabase email/password sign-up and sign-in
- Signup fields for name, phone, role, password and password confirmation
- Player and turf manager role selection using `player` and `manager` values
- Email confirmation callback at `/auth/callback`
- Profile updates for `phone` and `role` after authentication
- Database-triggered profile creation remains responsible for `id` and `name`
- Protected dashboard behavior that redirects unauthenticated users to sign-in
- Role-aware dashboard content based on `profiles.role`
- Real profile name and avatar initials loaded from Supabase
- Sign-out through the profile menu and desktop sidebar
- Responsive desktop and mobile dashboard shells
- Turquoise AM Sports visual system with larger desktop typography

The dashboard currently uses designed sample content for player and manager sections. Live booking, pitch, team, messaging, and admin data modules are planned for later sprints.

## Supabase authentication setup

1. Copy `.env.local.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. In Supabase, add these Auth redirect URLs:

```text
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

3. Enable email confirmation for the current signup flow. Users confirm their email through the `/auth/callback` route before entering the dashboard.

The signup form sends the display name as Auth metadata. The database trigger creates the `profiles` row; the browser then updates only `phone` and `role` for the authenticated user. It never inserts a profile or changes `id`, `status`, or `avatar_url`.
