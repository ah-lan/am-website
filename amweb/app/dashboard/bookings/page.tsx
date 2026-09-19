"use client";

import Link from "next/link";

export default function BookingsPage() {
  return (
    <main className="dashboard-placeholder-shell">
      <section className="dashboard-placeholder-card">
        <p className="dashboard-eyebrow">AM BOOKINGS</p>
        <h1>Keep every booking in view.</h1>
        <p>Booking requests, confirmations, and history will live here.</p>
        <Link className="primary-action" href="/dashboard">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
