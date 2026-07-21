"use client";

import { useEffect, useState } from "react";
import { Button } from "@repo/ui/Button";
import { createClient } from "@/lib/supabase/client";

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

export default function AdminAssignTechnicianPage() {
  const [roleChecked, setRoleChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");

  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
          const [bookingsRes, techniciansRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/bookings`, { headers }),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/technicians`, { headers }),
          ]);
          if (bookingsRes.ok) setBookings(await bookingsRes.json());
          if (techniciansRes.ok) setTechnicians(await techniciansRes.json());
        }
      }
      setRoleChecked(true);
    })();
  }, []);

  const handleAssign = async () => {
    setError(null);
    setSuccess(null);

    if (!selectedBookingId || !selectedTechnicianId) {
      setError("Select both a booking and a technician.");
      return;
    }

    setAssigning(true);

    try {
      const headers = await getAuthHeader();
      if (!headers) {
        setError("Your session expired. Please sign in again.");
        return;
      }

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
        Assign Technician
      </h1>

      {technicians.length === 0 && (
        <p className="mb-6 rounded-2xl bg-secondary-container/20 p-4 font-sans text-body-sm text-on-surface-variant">
          No technician accounts exist yet — a user needs `role: TECHNICIAN` set before they can
          be assigned.
        </p>
      )}

      <div className="mx-auto max-w-xl space-y-6">
        <div className="glass rounded-3xl p-6">
          <label className="mb-2 block px-1 font-sans text-label-md text-on-surface-variant">
            Booking
          </label>
          <select
            value={selectedBookingId}
            onChange={(e) => setSelectedBookingId(e.target.value)}
            className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a booking…</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} — {b.userEmail} — {b.serviceTitle ?? "No service"} ({b.status})
              </option>
            ))}
          </select>
        </div>

        <div className="glass rounded-3xl p-6">
          <label className="mb-2 block px-1 font-sans text-label-md text-on-surface-variant">
            Technician
          </label>
          <select
            value={selectedTechnicianId}
            onChange={(e) => setSelectedTechnicianId(e.target.value)}
            className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a technician…</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.email}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="font-sans text-body-sm text-error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="font-sans text-body-sm text-secondary" role="status">
            {success}
          </p>
        )}

        <Button type="button" variant="accent" fullWidth disabled={assigning} onClick={handleAssign}>
          {assigning ? "Assigning…" : "Assign Technician"}
        </Button>
      </div>
    </div>
  );
}
