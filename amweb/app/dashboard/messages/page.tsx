"use client";

import Link from "next/link";

export default function MessagesPage() {
  return (
    <main className="dashboard-placeholder-shell">
      <section className="dashboard-placeholder-card">
        <p className="dashboard-eyebrow">AM MESSAGES</p>
        <h1>Keep your team close.</h1>
        <p>Booking conversations and team messages will appear here.</p>
        <Link className="primary-action" href="/dashboard">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
