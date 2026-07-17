"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const fieldClasses =
  "w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/20 appearance-none";

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
      <div className="w-full max-w-md rounded-[32px] border border-white/40 bg-surface-container-lowest p-10 text-center shadow-xl shadow-primary/5">
        <span className="material-symbols-outlined mb-4 text-5xl text-secondary">
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
    <div className="w-full max-w-md rounded-[32px] border border-white/40 bg-surface-container-lowest p-10 shadow-xl shadow-primary/5">
      <h2 className="mb-2 font-display text-headline-md text-primary">
        {isBookingIntent
          ? "Sign in to book"
          : mode === "login"
            ? "Welcome back"
            : "Create your account"}
      </h2>
      <p className="mb-8 font-sans text-body-md text-on-surface-variant">
        {isBookingIntent
          ? mode === "login"
            ? "Sign in to continue scheduling your service."
            : "Create an account to schedule your service — it only takes a minute."
          : mode === "login"
            ? "Sign in to track your bookings and property health."
            : "Book services and track your property health online."}
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <div className="space-y-2">
            <label className="px-1 font-sans text-label-md text-on-surface-variant">
              Full Name
            </label>
            <input
              required
              className={fieldClasses}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}
        <div className="space-y-2">
          <label className="px-1 font-sans text-label-md text-on-surface-variant">
            Email
          </label>
          <input
            required
            type="email"
            className={fieldClasses}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="px-1 font-sans text-label-md text-on-surface-variant">
            Password
          </label>
          <input
            required
            minLength={6}
            type="password"
            className={fieldClasses}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="font-sans text-body-sm text-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-4 font-sans text-label-md font-semibold text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Sign Up"}
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
  );
}
