"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await supabase?.auth.signOut();
    router.replace("/");
  }

  return (
    <main className="auth-simple-shell approval-shell">
      <section className="simple-auth-card approval-card" role="status">
        <span className="approval-icon">⌛</span>
        <p className="eyebrow">MANAGER APPLICATION</p>
        <h1>We&apos;re reviewing your venue.</h1>
        <p className="simple-description">
          Your manager account is ready, but an AM Sports admin needs to approve it before you can manage bookings and venues.
        </p>
        <p className="approval-note">We&apos;ll let you know as soon as your account is approved.</p>
        <button className="submit-button" onClick={handleSignOut} disabled={isSigningOut}>
          {isSigningOut ? "Signing out..." : "Sign out"}<span aria-hidden="true">↪</span>
        </button>                            
      </section>
    </main>
  );
}
