# AM Sports — Database Schema (Phase 1: League & Team Management)

Living document. Update it whenever you add or change a table.

Turf booking tables (turfs, slots, bookings, equipment, messages, subscriptions,
notifications) are intentionally left out of this file — they get added when
Sprint 10 starts, not before. No need to think about them yet.

Conventions:
- Every table has `id uuid primary key default gen_random_uuid()`
- Every table has `created_at timestamptz default now()`
- `PK` = primary key, `FK` = foreign key
- Enable Row Level Security (RLS) on every table in Supabase before going live

---

### profiles
Extends Supabase Auth. One row per person with a login account.
Created automatically via a database trigger when a new auth user signs up. The trigger reads `name`, `phone`, and `role` from Auth metadata; the frontend does not insert or complete the profile row.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | → `auth.users.id` (same id, not a separate one) |
| name | text | display name |
| phone | text | read from signup metadata; verified via SMS OTP later |
| role | text | read from signup metadata: `player` / `manager` / `admin` |
| status | text | `pending` / `approved` / `suspended` — managers start as `pending` |
| avatar_url | text | nullable |

---

### teams
**Build this one first.** Everything else in Phase 1 points back to it.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| manager_id | uuid FK | → `profiles.id` |
| name | text | |
| logo_url | text | nullable, stored in Supabase Storage |
| founded_year | int | nullable |
---



### players
A person on a team roster. **Not the same as a `profiles` row** — most players
won't have a login account. Keep these separate.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| team_id | uuid FK | → `teams.id` |
| name | text | |
| position | text | GK / DEF / MID / FWD |
| jersey_number | int | |
| photo_url | text | nullable |

---

### fixtures
A scheduled match between two teams.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| home_team_id | uuid FK | → `teams.id` |
| away_team_id | uuid FK | → `teams.id` |
| kickoff | timestamptz | |
| venue | text | free text for now |
| status | text | `scheduled` / `played` / `cancelled` |

---

### results
One row per played fixture. Split from `fixtures` so an unplayed match
simply has no result row.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| fixture_id | uuid FK | → `fixtures.id`, unique (one result per fixture) |
| home_score | int | |
| away_score | int | |

---

### player_stats
One row per player per fixture. This is what feeds the top-scorers table.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| player_id | uuid FK | → `players.id` |
| fixture_id | uuid FK | → `fixtures.id` |
| goals | int | default 0 |
| assists | int | default 0 |
| yellow_cards | int | default 0 |
| red_cards | int | default 0 |

---

### transfers

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| player_id | uuid FK | → `players.id` |
| from_team_id | uuid FK | → `teams.id`, nullable (new signing) |
| to_team_id | uuid FK | → `teams.id`, nullable (released) |
| transfer_date | date | |
| fee | int | nullable |

---

### news

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| author_id | uuid FK | → `profiles.id` |
| title | text | |
| body | text | |
| category | text | e.g. `match-report`, `announcement` |
| published | bool | default false |

---

## Not a table: the league standings

The league table is **calculated, not stored**. Derive it from `results` +
`fixtures` with a SQL view or query. Don't create a `standings` table — it
would go stale the moment a result is edited.

---

## Relationship summary

```
profiles ──< teams ──< players ──< player_stats >── fixtures ──o results
                │                      │
                └──< fixtures          └──< transfers
profiles ──< news
```

`──<` one-to-many · `──o` one-to-one/optional

---

## Build order (matches Sprints 1–9)

1. `profiles` (Sprint 1, already covered by auth)
2. `teams` (Sprint 2)
3. `players` (Sprint 3)
4. `fixtures` (Sprint 4)
5. `results` (Sprint 5)
6. `player_stats` (Sprint 7 — league table itself is calculated, not a table)
7. `news` (Sprint 8)
8. `transfers` (Sprint 9)

















????????????????????DAY 2????????????????????????????????????????????????
# Sprint 1 Handoff — Auth & Dashboards

For: [Teammate name]
From: [Your name]
What's already done: `profiles` table + auto-create trigger, live in Supabase.
What you're building: signup/login pages + the two dashboard shells.

---

## 1. What already exists in the database

### `profiles` table

| Column | Type | Notes |
|---|---|---|
| id | uuid | same as the Supabase Auth user id — you never set this yourself |
| name | text | auto-filled from signup, see below |
| phone | text | **empty by default — your signup form needs to fill this in** |
| role | text | `player` / `manager` / `admin` — **defaults to `player`, your form needs to let the user pick** |
| status | text | `pending` / `approved` / `suspended` — leave alone for now |
| avatar_url | text | nullable, ignore for Sprint 1 |
| created_at | timestamptz | automatic |

### How a profile gets created — important

When someone signs up through Supabase Auth, a database trigger automatically
creates a matching row in `profiles` with just `id` and `name` filled in.
**You don't insert into `profiles` yourself on signup.** But `role` and
`phone` are NOT set by the trigger — after signup succeeds, your form needs
to run one `update` call to fill those in. See the code below.

---

## 2. Environment setup (5 min)

Pull the latest from GitHub, then create your own `.env.local` in the project
root (this file is git-ignored, you need your own copy):

```
NEXT_PUBLIC_SUPABASE_URL=<ask for this>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ask for this>
```

The Supabase client is already set up at `lib/supabase.js` — import it,
don't recreate it:

```js
import { supabase } from '@/lib/supabase'
```

---

## 3. What to build

### Signup page
A form collecting: name, email, password, phone, role (radio: Player / Manager).

```js
async function handleSignup({ name, email, password, phone, role }) {
  // Step 1: create the auth user — this fires the trigger,
  // which creates a `profiles` row with id + name already filled in
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }, // this is what the trigger reads for `name`
  })
  if (error) throw error

  // Step 2: fill in the fields the trigger doesn't set
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ phone, role })
    .eq('id', data.user.id)
  if (updateError) throw updateError

  // Step 3: redirect based on role
  // player/manager -> their dashboard
  // manager -> also show "pending approval" messaging, since status defaults to 'approved'
  //            for now, but managers should show as pending once we wire that up (Sprint 2)
}
```

### Login page

```js
async function handleLogin({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  // fetch their profile to know which dashboard to send them to
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', data.user.id)
    .single()
  // redirect to /dashboard/player or /dashboard/manager based on profile.role
}
```

### Google Sign-In
Use `supabase.auth.signInWithOAuth({ provider: 'google' })`. Same trigger
fires, same profile gets created — just no password step. Ask before
building this if Google OAuth hasn't been enabled in the Supabase dashboard
yet (Authentication → Providers).

### Dashboard shells
Two empty pages for now — `/dashboard/player` and `/dashboard/manager` —
each just showing "Welcome, {profile.name}" and a sidebar/navbar. Real
content comes in later sprints.

---

## 4. Questions to ask before you start, not after

- Has Google OAuth been enabled in Supabase yet? (Authentication → Providers)
- What should happen if someone tries to log in before their manager account
  is approved? (Not solved yet — flag it, don't guess at it.)
- Do you have your own `.env.local` values yet?
