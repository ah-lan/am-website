**AM SPORTS**

**Web Platform Specification**

*Turf Booking & Management --- Web Edition*

Version 1.0 • 2026

Adapted from AM Sports Project Specification v2.0 (mobile-app spec)

*Confidential --- Internal Use Only*

**0. Purpose of This Document**

The original AM Sports spec (v2.0) was written for a native Flutter
mobile app. The product direction has changed: AM Sports will now launch
as a website (with the option to add a mobile app later). This document
rewrites the spec for that decision --- same problem, same users, same
core modules --- but with the technology choices, notification approach,
and roadmap adjusted for a web-first build.

Use this as the brief for the website build. Anywhere the approach
differs meaningfully from a native app, it\'s called out in a
highlighted note so the reasoning is clear.

*Everything about WHO we\'re building for and WHY (Sections 1--3, the
problem statement and user roles) is unchanged from the original spec
--- only the HOW (Sections 4 onward) is adapted for web.*

**1. Project Vision**

AM Sports is a football turf booking and management platform designed to
simplify how players find and reserve pitches, while helping turf
managers organise bookings efficiently and grow their business.

The platform adopts a Communication-First (Chat) approach combined with
structured booking workflows, ensuring clarity, flexibility, and trust
in a market where most coordination currently happens via phone calls
and WhatsApp.

Building this as a responsive website first means players can book from
a link --- shared on WhatsApp, Instagram, or Google --- with zero
download friction, while managers get the same booking, chat, and
dashboard tools through any browser. A mobile app remains a future
option once the core product and revenue model are proven.

Beyond discovery and booking, AM Sports is built with a clear
monetisation strategy for the platform itself --- enabling the
development team to sustain and grow the product over time while
providing genuine value to managers and players.

**2. Problem Statement**

**For Players**

-   Must call multiple turfs to check availability --- no centralised
    visibility

-   Uncertainty about pitch quality, location, and facilities before
    arrival

-   No reliable booking confirmation --- risk of showing up to a booked
    pitch

-   No knowledge of equipment availability (shoes, bibs, balls) or
    rental prices

**For Turf Managers**

-   Bookings managed informally via calls and WhatsApp --- error-prone
    and time-consuming

-   Double-bookings occur due to poor scheduling visibility

-   No structured way to track requests, confirm slots, or communicate
    with clients

-   No professional channel to showcase their facility

**For the Platform (Developers)**

-   No existing Uganda-focused turf booking product to model from

-   Must create a sustainable revenue model that does not require
    complex in-app payment infrastructure at launch

-   Must reach players and managers without requiring an app-store
    download at launch

**3. User Roles & Goals**

  ------------------------------------------------------------------------
  **Role**         **Who They Are**                **Primary Goal**
  ---------------- ------------------------------- -----------------------
  Player           Any person looking to book a    Find and reserve a turf
                   football pitch                  slot quickly and
                                                   confidently

  Manager          Turf owner or operator          Manage bookings, reduce
                                                   conflicts, showcase
                                                   their facility

  Admin            The AM Sports development team  Oversee the platform,
                                                   approve managers,
                                                   manage revenue
  ------------------------------------------------------------------------

**3A. The Player**

**Key Pain Points**

-   Calling multiple turfs to check availability

-   Uncertainty about pitch quality, location, and pricing

-   Lack of reliable booking confirmation

**Solution Features (Website)**

-   Real-time availability calendar with 7-day rolling view, in the
    browser

-   High-quality turf images and detailed facility information

-   Embedded Google Maps view for location and directions

-   Equipment rental visibility (shoes, bibs, balls) with prices listed
    by manager

-   Ability to send booking requests and chat directly with managers

-   Booking history and status tracking, accessible from any device via
    login

    -   "Add to Home Screen" support (PWA) so returning players get an
        app-like shortcut without an app-store install

**3B. The Manager**

**Key Pain Points**

-   Managing bookings through phone calls and WhatsApp

-   Double bookings and poor scheduling visibility

-   No structured way to track and respond to requests

**Solution Features (Website)**

-   Centralised web dashboard for all booking requests

-   Slot management --- approve or decline booking requests

-   Built-in chat tied to each booking for direct client communication

-   Clear weekly calendar showing confirmed, pending, and available
    slots

-   Turf profile management --- upload photos, set price/hour, list
    pitch sizes and surface types

-   Equipment & rental listing --- shoes, bibs, balls with individual
    prices

-   Support for managing multiple turfs under one account

    -   Fully usable on a manager\'s phone browser --- no separate
        manager app needed

**3C. The Admin (AM Sports Team)**

**Why This Role Matters**

The admin panel is the control centre for the AM Sports team. It
provides oversight, quality control, and the tools needed to manage
revenue, resolve disputes, and grow the platform responsibly.

**Admin Capabilities**

-   Review and approve new manager registrations --- prevents fake or
    low-quality turf listings

-   View and manage all users (players, managers) across the platform

-   Monitor all bookings platform-wide for dispute resolution

-   Access platform analytics --- active turfs, booking volumes, peak
    hours, revenue data

-   Manage platform subscription billing and payment records for
    managers

-   Flag and investigate reported content or users

-   Broadcast announcements or notifications to all users

**4. Core Functional Modules (Web)**

**Module 1 --- Identity & Onboarding (AM-Auth)**

**Authentication Methods**

-   Google Sign-In (OAuth via Supabase Auth)

-   Email and Password (via Supabase Auth)

**Onboarding Flow**

-   Display name --- auto-fetched from Google or manually entered

-   Role selection --- Player or Manager

-   Phone number verification (SMS OTP) --- critical for coordination
    and booking notifications

-   Manager accounts enter a pending state until approved by Admin

    -   Sessions persist via secure browser cookies/JWT so users stay
        logged in across visits

**Module 2 --- Pitch Discovery (AM-Explore)**

**Football-Focused Search & Filters**

-   Pitch sizes: 5-a-side, 7-a-side, 9-a-side, 11-a-side

-   Surface type: Artificial Grass, Natural Grass, Sand

-   Lighting: Floodlights availability

-   Price range filter

-   Distance from current location, using the browser\'s Geolocation API

**Detailed Turf Profile**

-   Multiple high-quality turf photos uploaded by manager

-   Price per hour clearly displayed

-   Amenities listed: showers, parking, water, changing rooms

-   Equipment available for hire --- shoes (by size), bibs, balls ---
    each with rental price

-   Operating hours and available days

**Location & Maps**

-   Google Maps JavaScript API embed --- view turfs on an interactive
    map

-   Distance shown from player\'s current location (with browser
    permission prompt)

-   Tap-to-open directions in Google Maps (opens in a new tab)

    -   Each turf gets a shareable, indexable URL --- good for SEO and
        for sharing on WhatsApp

**Module 3 --- Booking System (AM-Schedule)**

*Booking Model: Request → Pending Lock → Manager Approves → Confirmed →
Pay at Venue*

**Slot Selection**

-   Players view a 7-day rolling availability calendar

-   Configurable time slots set by manager (e.g. 1 hour, 90 minutes)

-   Visual distinction between Available, Pending, and Confirmed slots

**Booking Request Flow**

-   Player selects an available slot and submits a booking request

-   Slot is immediately marked as Pending --- locked temporarily to
    prevent double-booking

-   Manager receives a notification (web push + email/SMS fallback) with
    booking details

-   Pending lock expires automatically if manager does not respond
    within a configurable window (e.g. 30 minutes)

-   Manager approves → slot becomes Confirmed and player is notified

-   Manager declines → slot reopens as Available and player is notified

**Payment Handling (MVP)**

-   No in-app payment processing required at launch

-   Players pay physically at the venue on arrival

-   Booking confirmation on the site acts as the reservation receipt
    (viewable and printable)

-   Managers and players can confirm payment details via in-app chat

**Future Upgrade --- Mobile Money**

-   MTN Mobile Money integration (web checkout redirect or STK-style
    prompt)

-   Airtel Money integration

-   Platform fee automatically deducted at point of payment

**Module 4 --- Equipment & Gear Rental (AM-Gear)**

Managers can list equipment available for hire alongside their turf.
This is separate from the turf booking price and gives players full
visibility before arriving.

**Manager Side**

-   Add equipment items: football boots (by size), bibs, footballs, shin
    guards

-   Set individual rental price per item per session

-   Mark items as available or unavailable

**Player Side**

-   View all available gear on the turf\'s web profile page

-   Prices displayed clearly alongside each item

-   Gear is arranged and paid for at the venue --- no in-app reservation
    required at MVP

**Module 5 --- Real-Time Chat (AM-Chat)**

**Contextual Messaging**

-   Each booking request automatically creates a dedicated chat thread
    between player and manager

-   Chat is tied to the booking --- booking summary (time, turf, status)
    is pinned at the top of the thread

-   Enables coordination on arrival time, team size, equipment needs,
    and payment confirmation

**Technical**

-   Real-time messaging powered by Supabase Realtime over WebSockets ---
    works the same in a browser as in a native app

-   Message history preserved for dispute resolution

-   Unread message indicators (badge counts, browser tab title) for both
    player and manager dashboards

**Module 6 --- Notifications (AM-Notify)**

*This is the biggest change from the mobile-app spec. Firebase Cloud
Messaging push notifications assumed an installed app. On the web,
notification delivery needs a layered approach because browser push has
real limits --- especially on iOS Safari, where web push only works once
a user adds the site to their Home Screen.*

**Web Notification Channels**

-   Web Push (via service worker) --- works on Android/desktop Chrome,
    Firefox, Edge out of the box

-   Email --- reliable fallback for every event, sent via a
    transactional email service (e.g. Resend, Postmark)

-   SMS --- for time-critical alerts (new booking request, pending
    expiry) where email may be too slow, given phone numbers are already
    verified at signup

-   In-app notification centre --- always available regardless of push
    support, so nothing is missed if a user simply revisits the site

**Events Covered**

-   New booking request (Manager)

-   Booking confirmed or declined (Player)

-   New chat message (Both)

-   Pending slot expiry warning (Manager)

-   Subscription renewal reminder (Manager)

-   Platform announcements (Admin broadcast)

**Module 7 --- Admin Panel (AM-Control)**

The Admin Panel is a separate, access-controlled section of the website,
available only to the AM Sports team. It shares the same codebase and
hosting as the main site but sits behind role-based access control, with
Supabase Studio available as a quick fallback for direct data fixes.

**Key Features**

-   Manager approval queue --- review and approve or reject new turf
    registrations

-   Full user directory --- view, search, suspend, or delete player and
    manager accounts

-   Platform-wide booking overview --- monitor all bookings and
    intervene if needed

-   Revenue dashboard --- subscription status per manager, payment
    history, earnings summary

-   Analytics --- daily/weekly/monthly active users, top turfs, peak
    booking times, conversion rates

-   Broadcast tool --- send email/SMS/web-push announcements to all
    users or specific segments

-   Dispute management --- review flagged conversations or bookings

**5. Revenue Model & Monetisation Strategy**

Monetisation is a core part of the AM Sports platform design, not an
afterthought. The following models are layered --- starting simple at
launch and expanding as the platform grows. This is unchanged by the
move to web.

**Tier 1 --- Manager Subscription (Launch Revenue)**

The primary revenue stream at launch. Managers pay a recurring fee to
list and manage their turfs on the platform.

  ------------------------------------------------------------------------
  **Plan**         **Price             **Features**
                   (UGX/Month)**       
  ---------------- ------------------- -----------------------------------
  Free Trial       0                   30-day trial, 1 turf listing, basic
                                       features

  Basic            50,000              1 turf, full booking system, chat,
                                       notifications

  Pro              100,000             Up to 3 turfs, priority listing,
                                       analytics dashboard

  Enterprise       Custom              5+ turfs, dedicated support,
                                       white-label options
  ------------------------------------------------------------------------

*Why this works: flat monthly subscriptions are predictable, easy to
communicate, and require no payment infrastructure changes to the
player-facing site. Managers are the paying customers --- players use
the website for free.*

**Tier 2 --- Featured Listings (Growth Revenue)**

-   Managers pay a one-time or recurring fee to have their turf appear
    at the top of search results

-   Promoted turfs get a \'Featured\' badge visible to all players

-   Sold as a weekly or monthly add-on on top of any subscription plan

**Tier 3 --- Commission on Bookings (Future)**

-   When Mobile Money integration is active, AM Sports takes a platform
    commission (e.g. 5--10%) on each completed booking

-   Commission is automatically deducted at point of payment --- no
    manual reconciliation needed

-   Players see the booking price clearly; commission is absorbed or
    added transparently

**Tier 4 --- Equipment Rental Facilitation (Future)**

-   If gear rental is brought into the booking flow, AM Sports takes a
    small cut on each rental transaction

-   This incentivises managers to list their equipment on the platform

**Launch Strategy**

*Recommendation: launch with a free 30-day trial for all managers to
build supply quickly. After 30 days, convert to the Basic plan. Use the
growth in active turfs to justify the Pro plan to high-volume managers.*

**6. Booking Flow**

  -----------------------------------------------------------------------
  **Step**   **What Happens**
  ---------- ------------------------------------------------------------
  1          Player opens the website and browses nearby turfs using
             location or map view

  2          Player opens a turf\'s profile page --- views photos,
             price/hour, gear rental options, and availability calendar

  3          Player selects an available time slot and submits a booking
             request

  4          Slot status changes to PENDING --- locked for up to 30
             minutes. No other player can book the same slot

  5          Manager receives a notification (web push / SMS / email) and
             reviews the request in their dashboard calendar

  6A ✅      Approved --- slot becomes CONFIRMED. Player is notified. A
             chat thread is opened for coordination. Player pays at venue

  6B ❌      Declined --- slot returns to AVAILABLE. Player is notified
             with a message. They can choose another slot

  7          Player arrives at turf, pays physically, and plays. Manager
             marks booking as completed
  -----------------------------------------------------------------------

**7. Technical Stack (The AM Web Stack)**

  -------------------------------------------------------------------------
  **Component**    **Technology**        **Reason**
  ---------------- --------------------- ----------------------------------
  Frontend         Next.js (React)       Server-side rendering for fast
  Framework                              load + good SEO on turf listing
                                         pages; one codebase for the whole
                                         site

  Styling / UI     Tailwind CSS          Fast to build a responsive,
                                         mobile-friendly layout without a
                                         native app

  Hosting /        Vercel                Zero-config deploys for Next.js,
  Deployment                             automatic HTTPS, global CDN

  Backend /        Supabase (PostgreSQL) Realtime + relational data ---
  Database                               perfect for booking state
                                         management; managed, nothing to
                                         deploy yourself

  Authentication   Supabase Auth         Easy integration with Google
                                         Sign-In and Email/Password, works
                                         identically on web

  File Storage     Supabase Storage      Turf images, team logos, and
                                         profile media

  Maps & Location  Google Maps           Location discovery, directions,
                   JavaScript API +      nearby search --- browser-native
                   Geolocation API       

  Notifications    Web Push (service     Layered delivery since native FCM
                   worker) +             push isn\'t available without an
                   Resend/Postmark       installed app
                   (email) + SMS gateway 

  Progressive Web  next-pwa / Workbox    Lets players \'Add to Home
  App                                    Screen\' for an app-like shortcut
                                         without app-store distribution

  Admin Panel      Same Next.js app,     No separate codebase or server to
                   role-gated routes,    run --- Supabase gives you a table
                   backed by Supabase    editor for free while you build
                   Studio for quick data the custom dashboard
                   fixes                 

  Payments         MTN / Airtel Money    Mobile Money integration for the
  (Future)         API                   Uganda market, called from a
                                         Supabase Edge Function
  -------------------------------------------------------------------------

*Supabase was chosen over a self-hosted backend (e.g. Django)
specifically for deployment speed: auth, database, storage, and realtime
chat all come managed out of the box, so there\'s no server to provision
or maintain --- important for a two-person team that wants to ship
fast.*

*If a native mobile app is added later, this same Supabase backend
(database, auth, storage, realtime) can be reused --- only the frontend
layer would need a Flutter or React Native client built on top.*

**8. Database Architecture**

Unchanged from the original spec --- the data model doesn\'t depend on
whether the frontend is a website or a native app.

  --------------------------------------------------------------------------
  **Table**       **Key Fields**            **Purpose**
  --------------- ------------------------- --------------------------------
  profiles        id, name, phone, role,    All user accounts --- players,
                  status                    managers, and admins

  turfs           id, manager_id, name,     Turf listings managed by
                  size, surface, location,  approved managers
                  price_per_hour, status    

  equipment       id, turf_id, name, size,  Gear and equipment listed per
                  rental_price, available   turf

  slots           id, turf_id, start_time,  Time blocks per turf
                  duration, status          (available/pending/confirmed)

  bookings        id, player_id, slot_id,   Booking records with full status
                  status, created_at        history

  messages        id, booking_id,           Chat messages tied to each
                  sender_id, content,       booking
                  timestamp                 

  subscriptions   id, manager_id, plan,     Manager subscription and billing
                  start_date, end_date,     records
                  status                    

  notifications   id, user_id, type,        Notification log across web
                  channel, payload, read,   push, email, and SMS
                  created_at                
  --------------------------------------------------------------------------

**9. Development Roadmap**

**Phase 1 --- MVP: Core Functionality**

*Goal: get the basic booking loop working end-to-end for early testing
with real turfs, live on the web.*

-   Authentication --- Google Sign-In and Email/Password with role
    selection

-   Manager onboarding flow with Admin approval gate

-   Turf profile creation --- name, location, price, pitch size, surface
    type

-   Player turf browsing --- list and basic search

-   Booking request system --- slot selection, pending lock,
    approve/decline

-   Basic email notifications for booking events

-   Deploy to a production domain (e.g. amsports.ug) with HTTPS

**Phase 2 --- Communication Layer**

*Goal: make communication between players and managers seamless and
professional.*

-   Real-time in-app chat tied to each booking

-   Web push notification setup (service worker) with email/SMS fallback

-   Manager booking approval dashboard with calendar view

-   Pending slot auto-expiry logic

**Phase 3 --- Enhancement & Discovery**

*Goal: improve the player discovery experience and make turf profiles
richer, and make the site installable.*

-   Turf photo uploads by manager (multi-image gallery)

-   Equipment and gear rental listing per turf

-   Advanced search and filters --- pitch size, surface, price range,
    distance

-   Google Maps integration --- interactive map view and directions

-   Booking history for players and managers

-   PWA setup --- Add to Home Screen, offline-friendly shell

-   Basic SEO pass on turf and city landing pages

**Phase 4 --- Monetisation & Admin**

*Goal: activate revenue and give the team full platform oversight.*

-   Manager subscription billing --- Basic and Pro plans

-   Featured listing promotions for managers

-   Admin dashboard --- user management, analytics, approval queue

-   Revenue dashboard for the AM Sports team

-   Ratings and reviews for turfs

**Phase 5 --- Future Expansion**

-   Mobile Money integration --- MTN and Airtel (in-app payments with
    commission)

-   Player matching --- find other players near you looking for a game

-   Tournament management tools for managers

-   Loyalty rewards for frequent players

-   Multi-language support --- English and Luganda

-   Revisit a native mobile app once web traction and revenue justify it

**10. Key Risks & Mitigations**

  --------------------------------------------------------------------------
  **Risk**                 **Impact**   **Mitigation**
  ------------------------ ------------ ------------------------------------
  Managers don\'t respond  High         Auto-expiry after 30 mins + manager
  to pending bookings in                response-rate score visible to
  time                                  players

  Double-booking race      High         Atomic slot locking at database
  condition                             level using Postgres row-level
                                        locking

  Low manager adoption at  High         30-day free trial + personal
  launch                                onboarding support for first 10
                                        turfs

  Web push doesn\'t reach  High         Email + SMS fallback for every
  iOS Safari users who                  critical event; onboarding nudge to
  haven\'t added the site               Add to Home Screen
  to Home Screen                        

  Players pay and then     Medium       Booking chat log preserved; clear
  manager cancels                       cancellation policy in Terms of
                                        Service

  Managers bypass site and Medium       Site provides enough value
  take bookings directly                (visibility, calendar) that managers
                                        prefer using it

  Revenue insufficient to  Medium       Start with subscriptions early;
  sustain platform                      target 20 paying managers to cover
                                        running costs

  Slow page loads on cheap Medium       Server-side rendering, image
  Android phones /                      compression, and a lightweight PWA
  low-bandwidth                         shell
  connections                           
  --------------------------------------------------------------------------

**11. Success Metrics**

  ------------------------------------------------------------------------
  **Metric**                   **Target (3         **Target (12 Months)**
                               Months)**           
  ---------------------------- ------------------- -----------------------
  Active turf listings         15                  60+

  Registered players           200                 2,000+

  Bookings per week            50                  500+

  Paying manager subscriptions 10                  50+

  Monthly platform revenue     500,000             5,000,000+
  (UGX)                                            

  Avg. manager response time   \< 20 mins          \< 10 mins

  Booking confirmation rate    \> 70%              \> 85%

  Website monthly unique       1,000               15,000+
  visitors                                         

  \% of visits from mobile     Track baseline      \> 70%
  browsers                                         
  ------------------------------------------------------------------------

**Appendix --- Glossary**

  -----------------------------------------------------------------------
  **Term**           **Definition**
  ------------------ ----------------------------------------------------
  Slot               A specific date and time block available for booking
                     at a turf

  Pending            A slot that has been requested by a player and is
                     temporarily locked while awaiting manager approval

  Confirmed          A slot that has been approved by the manager ---
                     reserved for that player

  Manager            A turf owner or operator who lists and manages their
                     pitch on AM Sports

  Admin              The AM Sports development team with full platform
                     oversight

  AM Web Stack       The core technology stack: Next.js + Supabase +
                     Google Maps + Web Push/Email/SMS

  PWA                Progressive Web App --- a website that can be added
                     to a phone\'s home screen and behave like an app,
                     without app-store distribution

  Web Push           Browser-based push notifications delivered via a
                     service worker; supported on Android/desktop, and on
                     iOS only after Add to Home Screen

  SSR                Server-Side Rendering --- pages are rendered on the
                     server for faster first load and better SEO

  MoMo               Mobile Money --- MTN and Airtel payment integration
                     planned for future phases
  -----------------------------------------------------------------------
