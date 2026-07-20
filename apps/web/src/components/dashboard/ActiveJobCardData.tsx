"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ActiveJobCard, type ActiveJobBooking } from "./ActiveJobCard";
import { BOOKING_PROGRESS_STEP } from "@/lib/bookingStatus";

/** Furthest-along, soonest-scheduled non-terminal booking — the one worth surfacing on the dashboard. */
function pickMostRelevant(bookings: ActiveJobBooking[]): ActiveJobBooking | undefined {
  const active = bookings.filter((b) => b.status !== "COMPLETED" && b.status !== "CANCELLED");

  return [...active].sort((a, b) => {
    const stepDiff = BOOKING_PROGRESS_STEP[b.status] - BOOKING_PROGRESS_STEP[a.status];
    if (stepDiff !== 0) return stepDiff;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  })[0];
}

export function ActiveJobCardData() {
  const [booking, setBooking] = useState<ActiveJobBooking | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) setLoading(false);
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/bookings`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }

        const data = (await res.json()) as ActiveJobBooking[];
        if (!cancelled) setBooking(pickMostRelevant(Array.isArray(data) ? data : []));
      } catch {
        // Leave booking undefined — ActiveJobCard renders its empty state.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="glass flex items-center justify-center rounded-3xl p-8">
        <p className="text-on-surface-variant">Loading your active job…</p>
      </section>
    );
  }

  return <ActiveJobCard booking={booking} />;
}
