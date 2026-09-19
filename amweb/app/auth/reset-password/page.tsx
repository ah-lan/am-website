"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setIsReady(true);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsReady(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!supabase) {
      setErrorMessage("Authentication is not configured yet.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message);
    } else {
      await supabase.auth.signOut();
      setIsComplete(true);
    }

    setIsLoading(false);
  }

  const displayError = errorMessage || (!supabase ? "Authentication is not configured yet." : "");

  if (isComplete) {
    return (
      <main className="auth-simple-shell">
        <Link className="simple-brand" href="/"><span className="brand-mark">AM</span><span>AM SPORTS</span></Link>
        <section className="simple-auth-card success-message" role="status">
          <span className="success-icon">✓</span>
          <p className="eyebrow">PASSWORD UPDATED</p>
          <h1>You&apos;re back in control.</h1>
          <p>Your password has been changed. Sign in with your new password to continue.</p>
          <button className="submit-button" onClick={() => router.push("/")}>Back to sign in <span aria-hidden="true">↗</span></button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-simple-shell">
      <Link className="simple-brand" href="/"><span className="brand-mark">AM</span><span>AM SPORTS</span></Link>
      <section className="simple-auth-card">
        <p className="eyebrow">SET A NEW PASSWORD</p>
        <h1>Make it a strong one.</h1>
        <p className="simple-description">Choose a new password with at least 8 characters.</p>
        {displayError && <p className="auth-error" role="alert">{displayError}</p>}
        {!isReady ? (
          <div className="reset-waiting"><p>This reset link is missing or has expired.</p><Link className="text-button" href="/auth/forgot-password">Request a new link</Link></div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label><span>New password</span><span className="password-wrap"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required placeholder="Enter your new password" /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></span></label>
            <label><span>Confirm new password</span><span className="password-wrap"><input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required placeholder="Re-enter your new password" /></span></label>
            <button className="submit-button" type="submit" disabled={isLoading}>{isLoading ? "Updating..." : "Update password"}<span aria-hidden="true">↗</span></button>
          </form>
        )}
        <Link className="back-link" href="/">← Back to sign in</Link>
      </section>
    </main>
  );
}
