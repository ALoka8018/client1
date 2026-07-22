"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const fieldClasses =
  "w-full rounded-2xl border-none bg-surface-container-low py-4 pl-13 pr-6 font-sans text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/20 appearance-none";

function FieldIcon({ icon }: { icon: string }) {
  return (
    <span
      className="material-symbols-outlined pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-outline"
      aria-hidden
    >
      {icon}
    </span>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const switchModeHref = mode === "login" ? "/signup" : "/login";
  const switchModeQuery = next ? `?next=${encodeURIComponent(next)}` : "";
  const isBookingIntent = next === "/book";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setSignupDone(true);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(next ?? "/dashboard");
    router.refresh();
  };

  if (signupDone) {
    return (
      <div className="w-full max-w-md rounded-3xl bg-surface-container-lowest p-10 text-center shadow-level-2 motion-safe:animate-[card-rise_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <span
          className="material-symbols-outlined mb-4 text-5xl text-secondary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          mark_email_read
        </span>
        <h2 className="mb-2 font-display text-headline-md text-primary">
          Check your inbox
        </h2>
        <p className="font-sans text-body-md text-on-surface-variant">
          We sent a confirmation link to {email}. Confirm your email, then{" "}
          <Link
            href={`/login${switchModeQuery}`}
            className="font-semibold text-primary underline"
          >
            sign in
          </Link>
          {isBookingIntent ? " to continue your booking" : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center motion-safe:animate-[fade-up-blur_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container shadow-level-1">
          <span
            className="material-symbols-outlined text-4xl text-on-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            sensors
          </span>
        </div>
        <span className="font-display text-headline-md text-primary tracking-tight">
          Seepage Leakage All Solutions
        </span>
      </div>

      <div className="rounded-3xl bg-surface-container-lowest p-8 shadow-level-2 md:p-10 motion-safe:animate-[card-rise_0.7s_0.1s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="mb-8 text-center">
          <h1 className="font-display text-headline-lg-mobile text-primary md:text-headline-lg">
            {isBookingIntent
              ? "Sign in to book"
              : mode === "login"
                ? "Welcome back"
                : "Create your account"}
          </h1>
          <p className="mt-2 font-sans text-body-md text-on-surface-variant">
            {isBookingIntent
              ? mode === "login"
                ? "Sign in to continue scheduling your service."
                : "Create an account to schedule your service — it only takes a minute."
              : mode === "login"
                ? "Access your bookings and property health reports."
                : "Book services and track your property health online."}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="space-y-2">
              <label className="px-1 font-sans text-label-md text-on-surface-variant">
                Full Name
              </label>
              <div className="relative">
                <FieldIcon icon="person" />
                <input
                  required
                  className={fieldClasses}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="px-1 font-sans text-label-md text-on-surface-variant">
              Email
            </label>
            <div className="relative">
              <FieldIcon icon="mail" />
              <input
                required
                type="email"
                className={fieldClasses}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="font-sans text-label-md text-on-surface-variant">Password</label>
              {mode === "login" && (
                <Link
                  href="/forgot-password"
                  className="font-sans text-label-md font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <FieldIcon icon="lock" />
              <input
                required
                minLength={6}
                type={showPassword ? "text" : "password"}
                className={`${fieldClasses} pr-13`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <label className="flex items-start gap-3 py-1 font-sans text-body-md text-on-surface-variant">
              <input
                required
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="font-semibold text-primary hover:underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-semibold text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          )}

          {error && (
            <p className="font-sans text-body-sm text-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (mode === "signup" && !agreed)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary-container py-4 font-display text-headline-md text-on-secondary-container shadow-level-1 transition-all hover:brightness-95 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Sign In"
                : "Get Started"}
            {!loading && (
              <span className="material-symbols-outlined">
                {mode === "login" ? "login" : "arrow_forward"}
              </span>
            )}
          </button>
        </form>

        <p className="mt-8 text-center font-sans text-body-sm text-on-surface-variant">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href={`${switchModeHref}${switchModeQuery}`}
                className="font-semibold text-primary"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href={`${switchModeHref}${switchModeQuery}`}
                className="font-semibold text-primary"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4 motion-safe:animate-[fade-up-blur_0.6s_0.3s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 shadow-level-1">
          <span
            className="material-symbols-outlined text-sm text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
          <span className="font-sans text-label-md text-on-surface-variant">
            Certified Professionals
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 shadow-level-1">
          <span
            className="material-symbols-outlined text-sm text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            security
          </span>
          <span className="font-sans text-label-md text-on-surface-variant">
            Secure Account Protection
          </span>
        </div>
      </div>
    </div>
  );
}
