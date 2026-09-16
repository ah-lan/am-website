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
Created automatically via a trigger when a new auth user signs up.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | → `auth.users.id` (same id, not a separate one) |
| name | text | display name |
| phone | text | verified via SMS OTP |
| role | text | `player` / `manager` / `admin` |
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
