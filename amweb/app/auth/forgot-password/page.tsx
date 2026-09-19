"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/auth-validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    const normalizedEmail = email.trim();
    const emailError = validateEmail(normalizedEmail);

    if (emailError) {
      setErrorMessage(emailError);
      return;
    }

    if (!supabase) {
      setErrorMessage("Authentication is not configured yet.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSent(true);
    }

    setIsLoading(false);
  }

  return (
    <main className="auth-simple-shell">
      <Link className="simple-brand" href="/"><span className="brand-mark">AM</span><span>AM SPORTS</span></Link>
      <section className="simple-auth-card">
        {sent ? (
          <div className="success-message" role="status">
            <span className="success-icon">✓</span>
            <p className="eyebrow">CHECK YOUR INBOX</p>
            <h1>Reset link sent.</h1>
            <p>Use the link we sent to reset your AM Sports password. Check your spam folder if it does not arrive shortly.</p>
            <Link className="text-button" href="/">Back to sign in</Link>
          </div>
        ) : (
          <>
            <p className="eyebrow">ACCOUNT RECOVERY</p>
            <h1>Forgot your password?</h1>
            <p className="simple-description">Enter your email and we&apos;ll send you a secure reset link.</p>
            {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <label><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
              <button className="submit-button" type="submit" disabled={isLoading}>{isLoading ? "Sending..." : "Send reset link"}<span aria-hidden="true">↗</span></button>
            </form>
            <Link className="back-link" href="/">Back to sign in</Link>
          </>
        )}
      </section>
    </main>
  );
}
