"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="w-full max-w-md rounded-3xl bg-surface-container-lowest p-10 text-center shadow-level-2">
        <span
          className="material-symbols-outlined mb-4 text-5xl text-secondary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          mark_email_read
        </span>
        <h2 className="mb-2 font-display text-headline-md text-primary">Check your inbox</h2>
        <p className="font-sans text-body-md text-on-surface-variant">
          If an account exists for {email}, we sent a link to reset your password.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-surface-container-lowest p-8 shadow-level-2 md:p-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-headline-lg-mobile text-primary md:text-headline-lg">
            Reset your password
          </h1>
          <p className="mt-2 font-sans text-body-md text-on-surface-variant">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="px-1 font-sans text-label-md text-on-surface-variant">Email</label>
            <input
              required
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
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
            className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary-container py-4 font-display text-headline-md text-on-secondary-container shadow-level-1 transition-all hover:brightness-95 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-8 text-center font-sans text-body-sm text-on-surface-variant">
          <Link href="/login" className="font-semibold text-primary">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
