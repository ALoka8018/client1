"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@repo/ui/Badge";
import { Card } from "@repo/ui/Card";
import { buttonClasses } from "@repo/ui/Button";
import { useAdminRole } from "./layout";

type Dashboard = {
  todayBookingsCount: number;
  statusCounts: Record<string, number>;
  availableTechnicians: { id: string; name: string; email: string }[];
  latestReviews: { id: string; rating: number; body: string; userName: string; createdAt: string }[];
};

const STATUS_META: Record<string, { label: string; icon: string }> = {
  REQUESTED: { label: "Requested", icon: "inbox" },
  CONFIRMED: { label: "Confirmed", icon: "check_circle" },
  ASSIGNED: { label: "Assigned", icon: "person_pin" },
  EN_ROUTE: { label: "En Route", icon: "directions_car" },
  IN_PROGRESS: { label: "In Progress", icon: "engineering" },
  COMPLETED: { label: "Completed", icon: "task_alt" },
  CANCELLED: { label: "Cancelled", icon: "cancel" },
};

const QUICK_LINKS = [
  { href: "/admin/assign", label: "Assign Technician", icon: "assignment_ind" },
  { href: "/admin/services", label: "Manage Services", icon: "home_repair_service" },
  { href: "/admin/reviews", label: "Moderate Reviews", icon: "reviews" },
  { href: "/admin/photos", label: "Job Photos", icon: "photo_library" },
];

const SUPER_ADMIN_QUICK_LINKS = [
  { href: "/admin/staff", label: "Manage Staff & Users", icon: "manage_accounts" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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

export default function AdminPage() {
  const { role, headers } = useAdminRole();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    (async () => {
      const dashboardRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/dashboard`, {
        headers,
      });
      if (dashboardRes.ok) setDashboard(await dashboardRes.json());
    })();
  }, [headers]);

  return (
    <div className="container-max py-section-mobile md:py-section-desktop">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-headline-lg-mobile text-primary md:text-headline-lg">
            Admin Dashboard
          </h1>
          <p className="mt-1 font-sans text-body-sm text-on-surface-variant">
            Seepage Doctor · Central Management
          </p>
        </div>
        <Badge variant="primary" className="w-fit normal-case">
          <span className="h-1.5 w-1.5 rounded-full bg-primary motion-safe:animate-pulse" />
          Operations Active
        </Badge>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {[...QUICK_LINKS, ...(role === "SUPER_ADMIN" ? SUPER_ADMIN_QUICK_LINKS : [])].map(
          (link) => (
            <Link
              key={link.href}
              href={link.href}
              className={buttonClasses({ variant: "outline", size: "sm", pill: true })}
            >
              <span className="material-icon text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ),
        )}
      </div>

      {!dashboard ? (
        <p className="text-on-surface-variant">Loading dashboard…</p>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
            <Card className="p-5">
              <span className="material-icon text-primary">calendar_today</span>
              <p className="mt-3 font-display text-headline-md text-primary tabular-nums">
                {dashboard.todayBookingsCount}
              </p>
              <p className="font-sans text-label-md text-on-surface-variant">
                Today&apos;s Bookings
              </p>
            </Card>
            {Object.entries(dashboard.statusCounts).map(([status, count]) => {
              const meta = STATUS_META[status] ?? { label: status, icon: "help" };
              return (
                <Card key={status} className="p-5">
                  <span className="material-icon text-on-surface-variant">
                    {meta.icon}
                  </span>
                  <p className="mt-3 font-display text-headline-md text-primary tabular-nums">
                    {count}
                  </p>
                  <p className="font-sans text-label-md text-on-surface-variant">{meta.label}</p>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-headline-sm text-primary">
                  Available Technicians
                </h2>
                <Link
                  href="/admin/assign"
                  className="font-sans text-label-md font-semibold text-primary hover:underline"
                >
                  Assign
                </Link>
              </div>
              {dashboard.availableTechnicians.length === 0 ? (
                <p className="font-sans text-body-sm text-on-surface-variant">
                  No active technicians.
                </p>
              ) : (
                <ul className="space-y-2">
                  {dashboard.availableTechnicians.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-surface-container-low"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container/10 font-sans text-sm font-bold text-primary">
                        {initials(t.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-sm font-bold text-on-surface">
                          {t.name}
                        </p>
                        <p className="truncate text-xs text-on-surface-variant">{t.email}</p>
                      </div>
                      <Badge variant="primary" className="shrink-0">
                        Ready
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-headline-sm text-primary">Latest Reviews</h2>
                <Link
                  href="/admin/reviews"
                  className="font-sans text-label-md font-semibold text-primary hover:underline"
                >
                  Moderate All
                </Link>
              </div>
              {dashboard.latestReviews.length === 0 ? (
                <p className="font-sans text-body-sm text-on-surface-variant">No reviews yet.</p>
              ) : (
                <ul className="space-y-2">
                  {dashboard.latestReviews.map((r) => (
                    <li key={r.id} className="rounded-2xl p-3 hover:bg-surface-container-low">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <p className="truncate font-sans text-sm font-bold text-on-surface">
                          {r.userName}
                        </p>
                        <span className="shrink-0 text-xs text-on-surface-variant">
                          {timeAgo(r.createdAt)}
                        </span>
                      </div>
                      <StarRating rating={r.rating} />
                      <p className="mt-1 line-clamp-2 font-sans text-body-sm text-on-surface-variant">
                        {r.body}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
