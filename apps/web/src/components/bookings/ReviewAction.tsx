"use client";

import { useState } from "react";
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/Button";
import { Textarea } from "@repo/ui/Input";
import { createClient } from "@/lib/supabase/client";

type Review = { id: string; rating: number };

interface ReviewActionProps {
  bookingId: string;
  existingReview: Review | null;
  onSubmitted: (review: Review) => void;
}

function StarPicker({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          className="p-0.5"
        >
          <span
            className={cn(
              "material-symbols-outlined text-2xl",
              star <= value ? "text-secondary" : "text-outline-variant",
            )}
            style={star <= value ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={cn(
            "material-symbols-outlined text-lg",
            star <= rating ? "text-secondary" : "text-outline-variant",
          )}
          style={star <= rating ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          star
        </span>
      ))}
    </div>
  );
}

export function ReviewAction({ bookingId, existingReview, onSubmitted }: ReviewActionProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existingReview) {
    return (
      <div className="flex items-center gap-2">
        <StarDisplay rating={existingReview.rating} />
        <span className="text-xs text-on-surface-variant">Your review</span>
      </div>
    );
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Leave a review
      </Button>
    );
  }

  const handleSubmit = async () => {
    if (!body.trim()) {
      setError("Please share a few words about your experience.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Your session expired. Please sign in again.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ bookingId, rating, body }),
      });

      if (!res.ok) {
        const responseBody = await res.json().catch(() => null);
        setError(responseBody?.error ?? "Could not submit your review. Please try again.");
        setLoading(false);
        return;
      }

      const review = (await res.json()) as Review;
      onSubmitted(review);
      setOpen(false);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3 rounded-2xl bg-surface-container-low p-4 md:w-80">
      <div className="space-y-1">
        <label className="px-1 font-sans text-label-md text-on-surface-variant">Rating</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div className="space-y-1">
        <label className="px-1 font-sans text-label-md text-on-surface-variant">
          Your experience
        </label>
        <Textarea
          rows={3}
          placeholder="How did the service go?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      {error && (
        <p className="font-sans text-xs text-error" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={() => setOpen(false)}
        >
          Nevermind
        </Button>
        <Button type="button" variant="primary" size="sm" disabled={loading} onClick={handleSubmit}>
          {loading ? "Submitting…" : "Submit review"}
        </Button>
      </div>
    </div>
  );
}
