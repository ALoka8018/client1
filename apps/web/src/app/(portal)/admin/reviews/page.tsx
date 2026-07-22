"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  rating: number;
  body: string;
  status: "PENDING" | "APPROVED" | "HIDDEN";
  user: { name: string };
  createdAt: string;
};

async function getAuthHeader(): Promise<{ Authorization: string } | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : null;
}

function Restricted() {
  return (
    <div className="container-max flex flex-col items-center py-section-mobile text-center md:py-section-desktop">
      <span className="material-symbols-outlined mb-6 text-6xl text-outline">lock</span>
      <h1 className="mb-4 font-display text-headline-md text-primary">
        Admin Panel — Restricted
      </h1>
      <p className="max-w-md font-sans text-body-md text-on-surface-variant">
        This area is limited to Seepage Leakage All Solutions staff accounts with administrative
        permissions. If you believe you should have access, contact your account manager.
      </p>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [roleChecked, setRoleChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async (headers: { Authorization: string }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/reviews`, { headers });
    if (res.ok) setReviews(await res.json());
  };

  useEffect(() => {
    (async () => {
      const headers = await getAuthHeader();
      if (!headers) {
        setRoleChecked(true);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/me`, { headers });
      if (res.ok) {
        const me = await res.json();
        setIsAdmin(me.role === "ADMIN");
        if (me.role === "ADMIN") await loadReviews(headers);
      }
      setRoleChecked(true);
    })();
  }, []);

  const handleStatusChange = async (id: string, status: Review["status"]) => {
    setError(null);
    const headers = await getAuthHeader();
    if (!headers) {
      setError("Your session expired. Please sign in again.");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Could not update review.");
      return;
    }

    await loadReviews(headers);
  };

  if (!roleChecked) {
    return (
      <div className="container-max py-section-mobile text-center md:py-section-desktop">
        <p className="text-on-surface-variant">Checking access…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Restricted />;
  }

  return (
    <div className="container-max py-section-mobile md:py-section-desktop">
      <h1 className="mb-8 font-display text-headline-lg-mobile text-primary md:text-headline-lg">
        Moderate Reviews
      </h1>

      {error && (
        <p className="mb-4 font-sans text-body-sm text-error" role="alert">
          {error}
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="text-on-surface-variant">No reviews yet.</p>
      ) : (
        <ul className="mx-auto max-w-2xl space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="glass rounded-3xl p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-sans text-sm font-bold text-on-surface">
                  {r.user.name} — ⭐ {r.rating}
                </p>
                <span className="rounded-full bg-secondary-container px-3 py-1 font-sans text-label-sm text-on-secondary-container">
                  {r.status}
                </span>
              </div>
              <p className="mb-4 font-sans text-body-sm text-on-surface-variant">{r.body}</p>
              <div className="flex gap-2">
                {(["APPROVED", "HIDDEN", "PENDING"] as const)
                  .filter((s) => s !== r.status)
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStatusChange(r.id, s)}
                      className="rounded-full border border-outline-variant/30 px-4 py-2 font-sans text-label-sm text-on-surface hover:bg-surface-container-low"
                    >
                      Set {s}
                    </button>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
