"use client";

import Link from "next/link";

export default function SchedulePage() {
  return (
    <main className="dashboard-placeholder-shell">
      <section className="dashboard-placeholder-card">
        <p className="dashboard-eyebrow">AM SCHEDULE</p>
        <h1>Your week, clearly scheduled.</h1>
        <p>Weekly slots and fixture scheduling will be available here.</p>
        <Link className="primary-action" href="/dashboard">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
