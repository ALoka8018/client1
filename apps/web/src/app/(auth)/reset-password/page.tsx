"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  if (done) {
    return (
      <div className="w-full max-w-md rounded-3xl bg-surface-container-lowest p-6 text-center sm:p-10 shadow-level-2">
        <span
          className="material-icon mb-4 text-5xl text-secondary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <h2 className="mb-2 font-display text-headline-md text-primary">Password updated</h2>
        <p className="font-sans text-body-md text-on-surface-variant">
          Redirecting you to your dashboard…
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="w-full max-w-md rounded-3xl bg-surface-container-lowest p-6 text-center sm:p-10 shadow-level-2">
        <p className="font-sans text-body-md text-on-surface-variant">
          Open this page from the reset link in your email.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-surface-container-lowest p-8 shadow-level-2 md:p-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-headline-lg-mobile text-primary md:text-headline-lg">
            Choose a new password
          </h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="px-1 font-sans text-label-md text-on-surface-variant">
              New password
            </label>
            <input
              required
              minLength={6}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
