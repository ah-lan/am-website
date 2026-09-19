"use client";

import Link from "next/link";

export default function FindPitchPage() {
  return (
    <main className="dashboard-placeholder-shell">
      <section className="dashboard-placeholder-card">
        <p className="dashboard-eyebrow">AM EXPLORE</p>
        <h1>Find your next pitch.</h1>
        <p>Pitch discovery, availability, and location filters will live here.</p>
        <Link className="primary-action" href="/dashboard">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
