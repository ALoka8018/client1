"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Dashboard = {
  todayBookingsCount: number;
  statusCounts: Record<string, number>;
  availableTechnicians: { id: string; name: string; email: string }[];
  latestReviews: { id: string; rating: number; body: string; userName: string; createdAt: string }[];
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

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Pending",
  CONFIRMED: "Confirmed",
  ASSIGNED: "Assigned",
  EN_ROUTE: "En Route",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function AdminPage() {
  const [roleChecked, setRoleChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

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

        if (me.role === "ADMIN") {
          const dashboardRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/dashboard`,
            { headers },
          );
          if (dashboardRes.ok) setDashboard(await dashboardRes.json());
        }
      }
      setRoleChecked(true);
    })();
  }, []);

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
        Admin Dashboard
      </h1>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/admin/assign"
          className="rounded-full bg-secondary-container px-6 py-3 font-sans text-label-md text-on-secondary-container"
        >
          Assign Technician
        </Link>
        <Link
          href="/admin/services"
          className="rounded-full bg-secondary-container px-6 py-3 font-sans text-label-md text-on-secondary-container"
        >
          Manage Services
        </Link>
        <Link
          href="/admin/reviews"
          className="rounded-full bg-secondary-container px-6 py-3 font-sans text-label-md text-on-secondary-container"
        >
          Moderate Reviews
        </Link>
        <Link
          href="/admin/photos"
          className="rounded-full bg-secondary-container px-6 py-3 font-sans text-label-md text-on-secondary-container"
        >
          Job Photos
        </Link>
      </div>

      {!dashboard ? (
        <p className="text-on-surface-variant">Loading dashboard…</p>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="glass rounded-3xl p-6 text-center">
              <p className="font-display text-headline-lg text-primary">
                {dashboard.todayBookingsCount}
              </p>
              <p className="font-sans text-label-md text-on-surface-variant">
                Today&apos;s Bookings
              </p>
            </div>
            {Object.entries(dashboard.statusCounts).map(([status, count]) => (
              <div key={status} className="glass rounded-3xl p-6 text-center">
                <p className="font-display text-headline-lg text-primary">{count}</p>
                <p className="font-sans text-label-md text-on-surface-variant">
                  {STATUS_LABELS[status] ?? status}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 font-display text-headline-sm text-primary">
                Available Technicians
              </h2>
              {dashboard.availableTechnicians.length === 0 ? (
                <p className="text-on-surface-variant">No active technicians.</p>
              ) : (
                <ul className="space-y-3">
                  {dashboard.availableTechnicians.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4"
                    >
                      <p className="font-sans text-sm font-bold text-on-surface">{t.name}</p>
                      <p className="text-xs text-on-surface-variant">{t.email}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h2 className="mb-4 font-display text-headline-sm text-primary">Latest Reviews</h2>
              {dashboard.latestReviews.length === 0 ? (
                <p className="text-on-surface-variant">No reviews yet.</p>
              ) : (
                <ul className="space-y-3">
                  {dashboard.latestReviews.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4"
                    >
                      <p className="font-sans text-sm font-bold text-on-surface">
                        {r.userName} — ⭐ {r.rating}
                      </p>
                      <p className="text-xs text-on-surface-variant">{r.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
