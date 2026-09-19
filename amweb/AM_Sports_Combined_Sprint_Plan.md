**AM SPORTS**

**Combined Sprint Plan & Task Breakdown**

*Turf Booking Marketplace + League & Team Management --- Web Build*

Version 1.0 • 2026 --- For a Two-Person Team

Merges: AM Sports Web Platform Specification + AM Sports Sprint Plan

*Confidential --- Internal Use Only*

**0. How This Plan Was Put Together**

AM Sports now covers two feature sets: the turf booking marketplace
(players, managers, bookings, chat, gear rental) from the Web Platform
Specification, and a league/team management system (teams, players,
fixtures, results, standings, stats, news, transfers) from the original
sprint plan.

This plan merges both into one sprint-by-sprint roadmap for a two-person
team, using the same split as before --- Project Lead handles data
model, backend, and business logic; Teammate handles frontend UI, forms,
and client-side work --- built on the web stack from the platform spec
(Next.js + Supabase), chosen specifically to keep deployment fast and
avoid running your own servers.

League & team management comes first, ahead of turf booking. The booking
system carries the most moving parts --- slot locking, pending-expiry
timers, approve/decline race conditions --- so it\'s sequenced later,
once the team has shipped several straightforward CRUD modules together
and the codebase, auth, and deployment pipeline are already proven.

*This is a long roadmap (19 sprints). If you want to ship sooner, Phase
1 (Sprints 0--9) is a complete, launchable product on its own --- a
league/team management site with no booking features. Phase 2 (turf
booking) can follow once that\'s live and the booking logic can get
proper attention. Treat the phase split below as a suggested cut point,
not a hard requirement.*

**Phase 1 --- League & Team Management**

**Sprint 0 --- Planning**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Write concept note covering   | -   Set up local dev environment  |
|     both feature sets             |                                   |
|                                   | -   Clone repo, run project       |
| -   Design ERD covering turfs,    |                                   |
|     bookings, teams, fixtures     | -   Review requirements           |
|                                   |                                   |
| -   Define requirements & scope   | -   Get familiar with Next.js +   |
|     for Phase 1 vs Phase 2        |     Tailwind                      |
|                                   |                                   |
| -   Create GitHub repo & project  |                                   |
|     board                         |                                   |
|                                   |                                   |
| -   Set up Supabase project +     |                                   |
|     Next.js scaffold              |                                   |
|                                   |                                   |
| -   Assign tasks                  |                                   |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Working project skeleton, database design, Git
repo.

**Sprint 1 --- Authentication & Dashboards**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Supabase Auth setup ---       | -   Login / signup pages          |
|     Google Sign-In +              |                                   |
|     Email/Password                | -   Role-selection UI             |
|                                   |                                   |
| -   Role-based access (player /   | -   Player dashboard shell        |
|     manager / admin)              |                                   |
|                                   | -   Manager dashboard shell       |
| -   Sessions (JWT / cookies)      |                                   |
|                                   | -   Sidebar / navbar              |
| -   Manager pending-approval      |                                   |
|     state                         |                                   |
|                                   |                                   |
| -   Profiles table & phone        |                                   |
|     verification                  |                                   |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Working auth for all three roles, with base
dashboards for each.

**Sprint 2 --- Team Management**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Team model                    | -   Team list page                |
|                                   |                                   |
| -   CRUD APIs                     | -   Team profile page             |
|                                   |                                   |
| -   Validation                    | -   Add / edit forms              |
|                                   |                                   |
| -   Logo upload                   | -   Search                        |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Complete Team module.

**Sprint 3 --- Player Management**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Player model                  | -   Player pages                  |
|                                   |                                   |
| -   CRUD                          | -   Forms                         |
|                                   |                                   |
| -   Assign player to team         | -   Search                        |
|                                   |                                   |
| -   Validation                    | -   Photo upload                  |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Complete Player module.

**Sprint 4 --- Fixtures**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Fixture model                 | -   Fixture pages                 |
|                                   |                                   |
| -   CRUD                          | -   Calendar view                 |
|                                   |                                   |
| -   Validation                    | -   Upcoming-matches widget       |
|                                   |                                   |
| -   Optional: link fixtures to    |                                   |
|     booked turf slots             |                                   |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Fixture scheduling module.

**Sprint 5 --- Results**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Score-entry logic             | -   Results pages                 |
|                                   |                                   |
| -   Store match winners           | -   Completed-matches list        |
|                                   |                                   |
| -   Match history                 |                                   |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Results module.

**Sprint 6 --- League Table**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Standings algorithm           | -   League table UI               |
|                                   |                                   |
| -   Points calculation            | -   Responsive table for mobile   |
|                                   |     browsers                      |
| -   Goal-difference calculation   |                                   |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Automatic, always-up-to-date standings.

**Sprint 7 --- Player Statistics**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Track goals, assists, cards,  | -   Stats pages                   |
|     appearances                   |                                   |
|                                   | -   Top-scorers leaderboard       |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Statistics module.

**Sprint 8 --- News**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   News CRUD                     | -   News listing page             |
|                                   |                                   |
| -   Categories                    | -   Article view                  |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** News module.

**Sprint 9 --- Transfers**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Transfer logic                | -   Transfer pages                |
|                                   |                                   |
| -   Transfer history              | -   Timeline UI                   |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Transfers module.

*Checkpoint: at the end of Sprint 9, the league/team management site is
a complete, launchable product --- teams, players, fixtures, results,
standings, stats, news, and transfers. Everything from here on is the
turf booking marketplace.*

**Phase 2 --- Turf Booking Marketplace**

**Sprint 10 --- Turf & Manager Onboarding**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Turf model & CRUD APIs        | -   Turf profile creation form    |
|                                   |                                   |
| -   Manager approval workflow     | -   Manager "My Turfs" list       |
|     (admin gate)                  |                                   |
|                                   | -   Turf edit page                |
| -   Validation rules              |                                   |
|                                   | -   Photo gallery upload UI       |
| -   Image upload via Supabase     |                                   |
|     Storage                       |                                   |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Managers can create, edit, and submit turf
profiles for approval.

**Sprint 11 --- Pitch Discovery**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Search/filter API --- size,   | -   Turf listing page             |
|     surface, price, lighting      |                                   |
|                                   | -   Filter UI                     |
| -   Geolocation-based distance    |                                   |
|     calculation                   | -   Turf detail page              |
|                                   |                                   |
|                                   | -   Google Maps embed             |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Players can browse, filter, and view turf
details on the map.

**Sprint 12 --- Booking System**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Slots model                   | -   Calendar / slot-picker UI     |
|                                   |                                   |
| -   Booking request logic         | -   Booking request flow          |
|                                   |                                   |
| -   Pending lock + auto-expiry    | -   Booking status page (player)  |
|     (30 min)                      |                                   |
|                                   | -   Approval calendar UI          |
| -   Approve / decline logic       |     (manager)                     |
|                                   |                                   |
| -   Atomic row-level slot locking |                                   |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** End-to-end booking loop works: request → pending
→ confirmed/declined.

**Sprint 13 --- Equipment & Gear Rental**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Equipment model & CRUD        | -   Gear listing UI on turf       |
|                                   |     profile                       |
| -   Link equipment to turf        |                                   |
|                                   | -   Manager gear management forms |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Managers can list rentable gear; players can see
it before arriving.

**Sprint 14 --- Real-Time Chat**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Supabase Realtime setup       | -   Chat UI                       |
|                                   |                                   |
| -   Chat thread tied to each      | -   Pinned booking-summary header |
|     booking                       |                                   |
|                                   | -   Unread-message indicators     |
| -   Message history storage       |                                   |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Players and managers can chat within the context
of a booking.

**Sprint 15 --- Notifications**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Web push service worker setup | -   In-app notification centre UI |
|                                   |                                   |
| -   Email integration (Resend /   | -   Notification preferences page |
|     Postmark)                     |                                   |
|                                   |                                   |
| -   SMS gateway integration       |                                   |
|                                   |                                   |
| -   Notification triggers for     |                                   |
|     booking events                |                                   |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Booking and chat events reach users via push,
email, or SMS.

**Sprint 16 --- Turf-Booking Admin Panel**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Manager approval queue        | -   Admin dashboard UI            |
|     (backend)                     |                                   |
|                                   | -   User directory                |
| -   Platform analytics queries    |                                   |
|                                   | -   Booking overview              |
| -   Revenue / subscription data   |                                   |
|     model                         | -   Broadcast tool UI             |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Admin can approve managers, monitor bookings,
and see basic analytics.

**Phase 3 --- Monetisation & Launch**

**Sprint 17 --- Monetisation**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Subscription billing logic    | -   Pricing page                  |
|     (Free Trial / Basic / Pro /   |                                   |
|     Enterprise)                   | -   Manager billing UI            |
|                                   |                                   |
| -   Featured-listing logic        | -   'Featured' badge styling      |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Revenue features live for managers.

**Sprint 18 --- Testing & Deployment**

+-----------------------------------+-----------------------------------+
| **Project Lead (You)**            | **Teammate**                      |
+===================================+===================================+
| -   Bug fixing                    | -   UI polish                     |
|                                   |                                   |
| -   Performance optimisation      | -   Documentation                 |
|                                   |                                   |
| -   Production deployment         | -   Cross-browser & cross-device  |
|     (Vercel)                      |     testing                       |
|                                   |                                   |
| -   Environment / secrets         |                                   |
|     configuration                 |                                   |
+-----------------------------------+-----------------------------------+

**Sprint Deliverable:** Production-ready system, live at a public
domain.

**Overall Responsibilities**

  -----------------------------------------------------------------------
  **Project Lead (You)**              **Teammate**
  ----------------------------------- -----------------------------------
  Project planning                    Frontend UI (Next.js / Tailwind)

  Database design (Supabase /         Forms
  PostgreSQL)                         

  Backend development                 API integration

  Business logic                      Client-side validation

  Integration                         Testing

  Code reviews                        Documentation

  Deployment                          
  -----------------------------------------------------------------------
