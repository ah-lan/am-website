"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const roleOptions = [
  {
    label: "Player",
    value: "player",
    description: "Book pitches and keep your games moving.",
  },
  {
    label: "Turf manager",
    value: "manager",
    description: "Manage your venue, slots, and bookings.",
  },
];

export default function Home() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("player");
  const [submitted, setSubmitted] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(false);
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function completeConfirmedSignup() {
      if (!supabase || !window.location.search.includes("confirmed=1")) {
        return;
      }

      const { data } = await supabase.auth.getUser();
      const user = data.user;
      const userPhone = user?.user_metadata?.phone;
      const userRole = user?.user_metadata?.role;

      if (!user || typeof userPhone !== "string" || typeof userRole !== "string") {
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ phone: userPhone, role: userRole })
        .eq("id", user.id);

      if (error) {
        setErrorMessage("Your email is confirmed, but we could not finish your profile. Please try again.");
        return;
      }

      setPendingConfirmation(false);
      window.history.replaceState({}, document.title, "/");
      router.push("/dashboard");
    }

    void completeConfirmedSignup();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!supabase) {
      setErrorMessage("Authentication is not configured yet. Add the Supabase environment variables to continue.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (isSignUp && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (isSignUp) {
      const name = String(formData.get("name") ?? "");
      const signupPhone = String(formData.get("phone") ?? "");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { name, phone: signupPhone, role },
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else if (data.session && data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ phone: signupPhone, role })
          .eq("id", data.user.id);

        if (profileError) {
          setErrorMessage("Your account was created, but we could not save your profile details.");
        } else {
          router.push("/dashboard");
        }
      } else {
        setPendingConfirmation(true);
        setSubmitted(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const normalizedMessage = error.message.toLowerCase();
        setErrorMessage(
          normalizedMessage.includes("email not confirmed")
            ? "Please confirm your email from the link we sent before signing in."
            : normalizedMessage.includes("invalid login credentials")
              ? "That email or password is not correct. Check both fields and try again."
              : error.message,
        );
      } else {
        router.push("/dashboard");
      }
    }

    setIsLoading(false);
  }

  return (
    <main className="auth-shell">
      <section className="auth-visual" aria-label="AM Sports overview">
        <div className="visual-topline">
          <Link className="brand-lockup" href="/" aria-label="AM Sports home">
            <span className="brand-mark">AM</span>
            <span>AM SPORTS</span>
          </Link>
          <span className="season-tag">PLAY THE WEEK</span>
        </div>

        <div className="visual-copy">
          <p className="eyebrow">THE GAME STARTS HERE</p>
          <h1>Find your pitch.<br /><em>Bring your people.</em></h1>
          <p className="visual-description">
            One place for the next kickabout, the right turf, and every game worth remembering.
          </p>
        </div>

        <div className="pitch-illustration" aria-hidden="true">
          <div className="pitch-line pitch-halfway" />
          <div className="pitch-line pitch-box pitch-box-left" />
          <div className="pitch-line pitch-box pitch-box-right" />
          <div className="pitch-circle" />
          <div className="pitch-dot pitch-dot-one" />
          <div className="pitch-dot pitch-dot-two" />
        </div>

        <div className="visual-footer">
          <span><strong>01</strong> Book with confidence</span>
          <span><strong>02</strong> Keep the team close</span>
          <span><strong>03</strong> Play more often</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="mobile-brand">
          <span className="brand-mark">AM</span>
          <span>AM SPORTS</span>
        </div>
        <div className="auth-card">
          <div className="auth-heading">
            <p className="eyebrow">{isSignUp ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</p>
            <h2>{isSignUp ? "Get in the game." : "Ready for your next game?"}</h2>
            <p>{isSignUp ? "Start booking better games today." : "Sign in to manage your games and bookings."}</p>
          </div>

          <div className="mode-switch" role="tablist" aria-label="Authentication mode">
            <button className={!isSignUp ? "active" : ""} onClick={() => { setIsSignUp(false); setSubmitted(false); }} role="tab" aria-selected={!isSignUp}>Sign in</button>
            <button className={isSignUp ? "active" : ""} onClick={() => { setIsSignUp(true); setSubmitted(false); }} role="tab" aria-selected={isSignUp}>Create account</button>
          </div>

          {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}
          {submitted ? (
            <div className="success-message" role="status">
              <span className="success-icon">✓</span>
              <h3>{pendingConfirmation ? "Check your inbox." : isSignUp ? "Account created." : "You’re all set."}</h3>
              <p>{pendingConfirmation ? "Confirm your email to finish setting up your AM Sports profile." : isSignUp ? "Your player or manager profile is ready." : "You have been signed in successfully."}</p>
              <button className="text-button" onClick={() => setSubmitted(false)}>Back to form</button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignUp && (
                <label>
                  <span>Full name</span>
                  <input type="text" name="name" placeholder="e.g. Alex Okello" required />
                </label>
              )}
              {isSignUp && (
                <label>
                  <span>Phone number</span>
                  <input type="tel" name="phone" placeholder="e.g. +256 700 000 000" value={phone} onChange={(event) => setPhone(event.target.value)} required />
                </label>
              )}
              <label>
                <span>Email address</span>
                <input type="email" name="email" placeholder="you@example.com" required />
              </label>
              <label>
                <span>Password</span>
                <span className="password-wrap">
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" minLength={8} required />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
                </span>
              </label>
              {isSignUp && (
                <label>
                  <span>Confirm password</span>
                  <span className="password-wrap">
                    <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Re-enter your password" minLength={8} required />
                  </span>
                </label>
              )}

              {isSignUp ? (
                <fieldset>
                  <legend>I’m joining as a...</legend>
                  <div className="role-options">
                    {roleOptions.map((option) => (
                      <button type="button" key={option.value} className={role === option.value ? "role-option selected" : "role-option"} onClick={() => setRole(option.value)}>
                        <span className="role-radio">{role === option.value ? "●" : "○"}</span>
                        <span><strong>{option.label}</strong><small>{option.description}</small></span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <div className="form-meta">
                  <label className="remember"><input type="checkbox" /> <span>Remember me</span></label>
                  <button type="button" className="text-button">Forgot password?</button>
                </div>
              )}

              <button type="submit" className="submit-button" disabled={isLoading}>{isLoading ? "Please wait..." : isSignUp ? "Create my account" : "Sign in"}<span aria-hidden="true">↗</span></button>
              <p className="terms-copy">By continuing, you agree to our <Link href="/">Terms</Link> and <Link href="/">Privacy Policy</Link>.</p>
            </form>
          )}
        </div>
        <p className="help-copy">Need a hand? <a href="mailto:hello@amsports.ug">Contact support</a></p>
      </section>
    </main>
  );
}
