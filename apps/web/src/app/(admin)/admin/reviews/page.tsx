"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, type BadgeProps } from "@repo/ui/Badge";
import { Card } from "@repo/ui/Card";
import { useAdminRole } from "../layout";

type Review = {
  id: string;
  rating: number;
  body: string;
  status: "PENDING" | "APPROVED" | "HIDDEN";
  user: { name: string };
  createdAt: string;
};

const STATUS_META: Record<
  Review["status"],
  { label: string; badgeVariant: BadgeProps["variant"] }
> = {
  APPROVED: { label: "Approved", badgeVariant: "primary" },
  PENDING: { label: "Pending", badgeVariant: "neutral" },
  HIDDEN: { label: "Hidden", badgeVariant: "error" },
};

const STATUS_ACTIONS: { status: Review["status"]; label: string; icon: string }[] = [
  { status: "APPROVED", label: "Approve", icon: "check_circle" },
  { status: "HIDDEN", label: "Hide", icon: "visibility_off" },
  { status: "PENDING", label: "Reset to Pending", icon: "schedule" },
];

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="material-icon text-base text-secondary"
          style={{ fontVariationSettings: i < rating ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { headers } = useAdminRole();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReviews = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/reviews`, { headers });
    if (res.ok) setReviews(await res.json());
  };

  useEffect(() => {
    (async () => {
      await loadReviews();
    })();
  }, [headers]);

  const handleStatusChange = async (id: string, status: Review["status"]) => {
    setError(null);
    setUpdatingId(id);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Could not update review.");
      setUpdatingId(null);
      return;
    }

    await loadReviews();
    setUpdatingId(null);
  };

  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;

  return (
    <div className="container-max py-section-mobile md:py-section-desktop">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 font-sans text-label-md text-on-surface-variant hover:text-primary"
      >
        <span className="material-icon text-base">arrow_back</span>
        Dashboard
      </Link>

      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-headline-lg-mobile text-primary md:text-headline-lg">
            Moderate Reviews
          </h1>
          <p className="mt-1 font-sans text-body-sm text-on-surface-variant">
            Approve, hide, or reset customer reviews before they appear publicly.
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="neutral" className="w-fit normal-case">
            {pendingCount} awaiting review
          </Badge>
        )}
      </div>

      {error && (
        <p className="mb-4 font-sans text-body-sm text-error" role="alert">
          {error}
        </p>
      )}

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface-container-low py-16 text-center">
          <span className="material-icon text-4xl text-outline">reviews</span>
          <p className="font-sans text-body-sm text-on-surface-variant">No reviews yet.</p>
        </div>
      ) : (
        <ul className="mx-auto max-w-2xl space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="p-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="font-sans text-sm font-bold text-on-surface">{r.user.name}</p>
                  <p className="text-xs text-on-surface-variant">{timeAgo(r.createdAt)}</p>
                </div>
                <Badge variant={STATUS_META[r.status].badgeVariant}>
                  {STATUS_META[r.status].label}
                </Badge>
              </div>
              <div className="mb-2">
                <StarRating rating={r.rating} />
              </div>
              <p className="mb-4 font-sans text-body-sm text-on-surface-variant">{r.body}</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_ACTIONS.filter((a) => a.status !== r.status).map((a) => (
                  <button
                    key={a.status}
                    type="button"
                    disabled={updatingId === r.id}
                    onClick={() => handleStatusChange(r.id, a.status)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/30 px-4 py-2 font-sans text-label-md text-on-surface hover:bg-surface-container-low disabled:opacity-50"
                  >
                    <span className="material-icon text-base">{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
