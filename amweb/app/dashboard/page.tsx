"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const playerNav = ["Overview", "Find a pitch", "My bookings", "Messages"];
const managerNav = ["Overview", "Bookings", "Schedule", "My venues", "Messages"];

function StatCard({ label, value, detail, tone = "default" }: { label: string; value: string; detail: string; tone?: string }) {
  return (
    <article className={`dashboard-stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function PlayerHome({ name }: { name: string }) {
  return (
    <>
      <section className="dashboard-hero player-hero">
        <div>
          <p className="dashboard-eyebrow">PLAYER HOME</p>
          <h1>Good afternoon, {name}.</h1>
          <p>Find a pitch, gather your team, and make your next game happen.</p>
        </div>
        <button className="primary-action">Find a pitch <span>↗</span></button>
      </section>

      <section className="dashboard-section">
        <div className="section-heading"><div><p className="dashboard-eyebrow">YOUR WEEK</p><h2>Keep the game close</h2></div><button className="quiet-action">View all bookings <span>→</span></button></div>
        <div className="player-grid">
          <article className="feature-card booking-card">
            <div className="card-topline"><span className="status-pill confirmed">Confirmed</span><span className="card-kicker">SAT · 24 AUG</span></div>
            <div className="booking-date"><strong>19:00</strong><span>— 20:00</span></div>
            <h3>Five-a-side under the lights</h3>
            <p>Astro Turf Kampala · 5-a-side</p>
            <div className="card-footer"><span>8 players joined</span><button className="icon-action" aria-label="Open booking">↗</button></div>
          </article>
          <article className="feature-card discover-card">
            <div className="discover-mark">+</div>
            <p className="dashboard-eyebrow">NEXT UP</p>
            <h3>Looking for another game?</h3>
            <p>Explore nearby turfs with open slots this week.</p>
            <button className="text-action">Explore pitches <span>→</span></button>
          </article>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading"><div><p className="dashboard-eyebrow">AT A GLANCE</p><h2>Your activity</h2></div></div>
        <div className="stats-grid"><StatCard label="Games played" value="12" detail="+3 this month" tone="turquoise" /><StatCard label="Upcoming" value="02" detail="Next: Saturday" /><StatCard label="Team invites" value="04" detail="2 need a reply" /></div>
      </section>
    </>
  );
}

function ManagerHome({ name }: { name: string }) {
  return (
    <>
      <section className="dashboard-hero manager-hero">
        <div>
          <p className="dashboard-eyebrow">MANAGER HOME</p>
          <h1>Good afternoon, {name}.</h1>
          <p>Keep your venues moving and every booking in view.</p>
        </div>
        <button className="primary-action">Manage venue <span>↗</span></button>
      </section>

      <section className="dashboard-section">
        <div className="section-heading"><div><p className="dashboard-eyebrow">ACTION NEEDED</p><h2>Today at a glance</h2></div><button className="quiet-action">Open bookings <span>→</span></button></div>
        <div className="stats-grid manager-stats"><StatCard label="New requests" value="08" detail="3 need a response" tone="turquoise" /><StatCard label="Today’s slots" value="14" detail="9 confirmed" /><StatCard label="Active venues" value="01" detail="Astro Turf Kampala" /></div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading"><div><p className="dashboard-eyebrow">UPCOMING</p><h2>Your next slots</h2></div><button className="quiet-action">Full schedule <span>→</span></button></div>
        <article className="schedule-card"><div className="schedule-day"><strong>24</strong><span>AUG<br />SAT</span></div><div className="schedule-info"><span className="status-pill pending">Pending</span><h3>James O. · 5-a-side</h3><p>19:00 – 20:00 · Astro Turf Kampala</p></div><button className="outline-action">Review request</button></article>
        <article className="schedule-card"><div className="schedule-day"><strong>24</strong><span>AUG<br />SAT</span></div><div className="schedule-info"><span className="status-pill confirmed">Confirmed</span><h3>Michael K. · 7-a-side</h3><p>20:00 – 21:30 · Astro Turf Kampala</p></div><button className="icon-action" aria-label="Open booking">↗</button></article>
      </section>
    </>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<"player" | "manager">("player");
  const [name, setName] = useState("there");
  const [avatarInitials, setAvatarInitials] = useState("AM");
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navItems = role === "player" ? playerNav : managerNav;

  useEffect(() => {
    async function loadProfile() {
      if (!supabase) {
        setIsLoading(false);
        router.replace("/");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setIsLoading(false);
        router.replace("/");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name, role, status")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        setIsLoading(false);
        router.replace("/");
        return;
      }

      const profileName = profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "there";
      const profileRole = profile?.role === "manager" ? "manager" : "player";

      if (profileRole === "manager" && profile?.status === "pending") {
        setIsLoading(false);
        router.replace("/pending-approval");
        return;
      }

      const initials = profileName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part[0])
        .join("")
        .toUpperCase();

      setName(profileName);
      setAvatarInitials(initials || "AM");
      setRole(profileRole);
      setIsLoading(false);
    }

    void loadProfile().catch(() => {
      setIsLoading(false);
      router.replace("/");
    });
  }, [router]);

  async function handleSignOut() {
    await supabase?.auth.signOut();
    router.replace("/");
  }

  if (isLoading) {
    return <main className="dashboard-loading">Loading your AM Sports home...</main>;
  }

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" href="/"><span className="brand-mark">AM</span><span>AM SPORTS</span></Link>
        <div className="sidebar-role"><span className="role-dot" />{role === "player" ? "Player account" : "Turf manager"}</div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {navItems.map((item, index) => <button className={index === 0 ? "active" : ""} key={item}><span className="nav-icon">{["◈", "⌕", "▣", "◌", "⌂"][index]}</span>{item}</button>)}
        </nav>
        <div className="sidebar-bottom"><button><span className="nav-icon">?</span>Help centre</button><button onClick={handleSignOut}><span className="nav-icon">↪</span>Sign out</button></div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header"><div className="mobile-dashboard-brand"><span className="brand-mark">AM</span><span>AM SPORTS</span></div><div className="header-tools"><button className="notification-button" aria-label="Notifications">◌<i /></button><div className="profile-menu"><button className="profile-button" aria-expanded={isProfileMenuOpen} aria-haspopup="menu" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}><span className="avatar">{avatarInitials}</span><span className="profile-name">{name}</span><span>⌄</span></button>{isProfileMenuOpen && <div className="profile-dropdown" role="menu"><button role="menuitem" onClick={handleSignOut}><span>↪</span>Sign out</button></div>}</div></div></header>
        <div className="dashboard-content">{role === "player" ? <PlayerHome name={name} /> : <ManagerHome name={name} />}</div>
      </section>
    </main>
  );
}
