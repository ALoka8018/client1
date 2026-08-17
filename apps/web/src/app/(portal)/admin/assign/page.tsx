"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@repo/ui/Badge";
import { Card } from "@repo/ui/Card";
import { Button } from "@repo/ui/Button";
import { useAdminRole } from "../layout";

type AdminBooking = {
  id: string;
  code: string;
  status: string;
  userEmail: string;
  serviceTitle: string | null;
};

type TechnicianOption = {
  id: string;
  name: string;
  email: string;
  rating: number;
  ratingCount: number;
};

const labelClasses = "px-1 font-sans text-label-md text-on-surface-variant";
const fieldClasses =
  "w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20";

export default function AdminAssignTechnicianPage() {
  const { headers } = useAdminRole();

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");

  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [bookingsRes, techniciansRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/bookings`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/technicians`, { headers }),
      ]);
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (techniciansRes.ok) setTechnicians(await techniciansRes.json());
    })();
  }, [headers]);

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const selectedTechnician = technicians.find((t) => t.id === selectedTechnicianId);

  const handleAssign = async () => {
    setError(null);
    setSuccess(null);

    if (!selectedBookingId || !selectedTechnicianId) {
      setError("Select both a booking and a technician.");
      return;
    }

    setAssigning(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/bookings/${selectedBookingId}/assign`,
        {
          method: "PATCH",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ technicianUserId: selectedTechnicianId }),
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Could not assign technician. Please try again.");
        return;
      }

      const technicianName =
        technicians.find((t) => t.id === selectedTechnicianId)?.name ?? "Technician";
      setSuccess(`${technicianName} assigned successfully.`);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="container-max py-section-mobile md:py-section-desktop">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 font-sans text-label-md text-on-surface-variant hover:text-primary"
      >
        <span className="material-icon text-base">arrow_back</span>
        Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-headline-lg-mobile text-primary md:text-headline-lg">
          Assign Technician
        </h1>
        <p className="mt-1 font-sans text-body-sm text-on-surface-variant">
          Match an open booking with an available technician.
        </p>
      </div>

      {technicians.length === 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-secondary-container/15 p-4">
          <span className="material-icon text-secondary">info</span>
          <p className="font-sans text-body-sm text-on-surface-variant">
            No technician accounts exist yet — a user needs <code>role: TECHNICIAN</code> set
            before they can be assigned.
          </p>
        </div>
      )}

      <Card className="mx-auto max-w-xl space-y-6 p-6">
        <div className="space-y-2">
          <label className={labelClasses}>Booking</label>
          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            className={fieldClasses}
          >
            <option value="">Select a booking…</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} — {b.userEmail} — {b.serviceTitle ?? "No service"} ({b.status})
              </option>
            ))}
          </select>
          {selectedBooking && (
            <div className="flex items-center gap-2 px-1">
              <Badge variant="neutral">{selectedBooking.status}</Badge>
              <span className="font-sans text-label-md text-on-surface-variant">
                {selectedBooking.serviceTitle ?? "No service selected"}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className={labelClasses}>Technician</label>
          <select
            value={selectedTechnicianId}
            onChange={(e) => setSelectedTechnicianId(e.target.value)}
            className={fieldClasses}
          >
            <option value="">Select a technician…</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.email} — ⭐ {t.rating.toFixed(1)}
                {t.ratingCount > 0 ? ` (${t.ratingCount} review${t.ratingCount === 1 ? "" : "s"})` : " (no reviews yet)"}
              </option>
            ))}
          </select>
          {selectedTechnician && (
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className="material-icon text-base text-secondary"
                  style={{
                    fontVariationSettings:
                      i < Math.round(selectedTechnician.rating) ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  star
                </span>
              ))}
              <span className="ml-1 font-sans text-label-md text-on-surface-variant">
                {selectedTechnician.ratingCount} review
                {selectedTechnician.ratingCount === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>

        {error && (
          <p className="font-sans text-body-sm text-error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="flex items-center gap-1.5 font-sans text-body-sm text-primary" role="status">
            <span className="material-icon text-base">check_circle</span>
            {success}
          </p>
        )}

        <Button type="button" variant="accent" fullWidth disabled={assigning} onClick={handleAssign}>
          {assigning ? "Assigning…" : "Assign Technician"}
        </Button>
      </Card>
    </div>
  );
}
