"use client";

import { useEffect, useState } from "react";
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/Button";
import { Input, Textarea } from "@repo/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { PayNowButton } from "@/components/payments/PayNowButton";
import { ReviewAction } from "@/components/bookings/ReviewAction";
import {
  type BookingStatus,
  RESCHEDULABLE_STATUSES,
  CANCELLABLE_STATUSES,
  BOOKING_STATUS_META,
} from "@/lib/bookingStatus";

type Tab = "active" | "completed" | "invoices";

type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "VOID";

type Invoice = {
  id: string;
  number: string;
  amount: string;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt: string | null;
  booking: { code: string; scheduledAt: string };
};

type Booking = {
  id: string;
  code: string;
  status: BookingStatus;
  scheduledAt: string;
  problemDescription: string;
  service: { title: string } | null;
  property: { addressLine: string; city: string };
  invoice: { id: string; number: string; status: InvoiceStatus; amount: string } | null;
  review: { id: string; rating: number } | null;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

/** yyyy-MM-ddThh:mm, the shape <input type="datetime-local"> expects. */
function toDateTimeLocalValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "active", label: "Active Bookings" },
  { key: "completed", label: "Completed" },
  { key: "invoices", label: "Invoices" },
];

type PendingAction = { bookingId: string; type: "reschedule" | "cancel" };

export function BookingsTabs() {
  const [tab, setTab] = useState<Tab>("active");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [newDate, setNewDate] = useState("");
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [invoicesFetched, setInvoicesFetched] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) {
            setBookingsError("Your session expired. Please sign in again.");
            setBookingsLoading(false);
          }
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/bookings`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
          if (!cancelled) setBookingsError("Could not load bookings. Please try again.");
          return;
        }

        const data = (await res.json()) as Booking[];
        if (!cancelled) setBookings(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setBookingsError("Could not reach the server. Please try again.");
      } finally {
        if (!cancelled) setBookingsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (tab !== "invoices" || invoicesFetched) return;

    let cancelled = false;
    setInvoicesLoading(true);
    setInvoicesError(null);

    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) {
            setInvoicesError("Your session expired. Please sign in again.");
            setInvoicesLoading(false);
            setInvoicesFetched(true);
          }
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/invoices`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
          if (!cancelled) {
            setInvoicesError("Could not load invoices. Please try again.");
          }
          return;
        }

        const data = (await res.json()) as Invoice[];
        if (!cancelled) {
          setInvoices(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setInvoicesError("Could not reach the server. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setInvoicesLoading(false);
          setInvoicesFetched(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tab, invoicesFetched]);

  const markReviewSubmitted = (bookingId: string, review: { id: string; rating: number }) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, review } : b)));
  };

  const markInvoicePaid = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, status: "PAID" as const } : invoice,
      ),
    );
  };

  const openReschedule = (booking: Booking) => {
    setPendingAction({ bookingId: booking.id, type: "reschedule" });
    setNewDate(toDateTimeLocalValue(booking.scheduledAt));
    setReason("");
    setActionError(null);
  };

  const openCancel = (booking: Booking) => {
    setPendingAction({ bookingId: booking.id, type: "cancel" });
    setReason("");
    setActionError(null);
  };

  const dismissAction = () => {
    setPendingAction(null);
    setActionError(null);
  };

  const submitAction = async () => {
    if (!pendingAction) return;
    setActionError(null);
    setActionLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setActionError("Your session expired. Please sign in again.");
        setActionLoading(false);
        return;
      }

      const body =
        pendingAction.type === "reschedule"
          ? { action: "reschedule", newDate: new Date(newDate).toISOString(), reason: reason || undefined }
          : { action: "cancel", reason: reason || undefined };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/bookings/${pendingAction.bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const responseBody = await res.json().catch(() => null);
        setActionError(responseBody?.error ?? "Could not update the booking. Please try again.");
        setActionLoading(false);
        return;
      }

      const updated = (await res.json()) as Booking;
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));
      setPendingAction(null);
    } catch {
      setActionError("Could not reach the server. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const activeBookings = bookings.filter(
    (b) => b.status !== "COMPLETED" && b.status !== "CANCELLED",
  );
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");

  return (
    <div>
      <div className="mb-8 flex overflow-x-auto border-b border-outline-variant whitespace-nowrap">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "px-6 py-3 font-sans text-label-md transition-all",
              tab === item.key
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-primary",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "active" && (
        <div>
          {bookingsLoading ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-on-surface-variant">
              Loading bookings…
            </p>
          ) : bookingsError ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-error">{bookingsError}</p>
          ) : activeBookings.length === 0 ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-on-surface-variant">
              No active bookings right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
              {activeBookings.map((booking) => {
                const meta = BOOKING_STATUS_META[booking.status];
                const isPending = pendingAction?.bookingId === booking.id;
                const canReschedule = RESCHEDULABLE_STATUSES.includes(booking.status);
                const canCancel = CANCELLABLE_STATUSES.includes(booking.status);

                return (
                  <div
                    key={booking.id}
                    className="relative overflow-hidden rounded-3xl border border-white/50 bg-surface-container-lowest p-6 shadow-level-1"
                  >
                    <div className={cn("absolute top-0 left-0 h-full w-1", meta.barClass)} />
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <span
                          className={cn(
                            "mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                            meta.badgeClass,
                          )}
                        >
                          {meta.label}
                        </span>
                        <h3 className="font-display text-headline-md text-primary">
                          {booking.service?.title ?? "Service Request"}
                        </h3>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {booking.code} • {booking.property.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-sans text-label-md text-primary">
                          {formatDateTime(booking.scheduledAt)}
                        </p>
                      </div>
                    </div>

                    {isPending ? (
                      <div className="space-y-3 rounded-2xl bg-surface-container-low p-4">
                        {pendingAction.type === "reschedule" ? (
                          <div className="space-y-2">
                            <label className="px-1 font-sans text-label-md text-on-surface-variant">
                              New date & time
                            </label>
                            <Input
                              type="datetime-local"
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="px-1 font-sans text-label-md text-on-surface-variant">
                              Reason (optional)
                            </label>
                            <Textarea
                              rows={2}
                              placeholder="Let us know why you're cancelling…"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                            />
                          </div>
                        )}
                        {actionError && (
                          <p className="font-sans text-xs text-error" role="alert">
                            {actionError}
                          </p>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={actionLoading}
                            onClick={dismissAction}
                          >
                            Nevermind
                          </Button>
                          <Button
                            type="button"
                            variant={pendingAction.type === "cancel" ? "accent" : "primary"}
                            size="sm"
                            disabled={actionLoading}
                            onClick={submitAction}
                          >
                            {actionLoading
                              ? "Saving…"
                              : pendingAction.type === "reschedule"
                                ? "Confirm new time"
                                : "Confirm cancellation"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
                        <div className="flex gap-4">
                          {canCancel && (
                            <button
                              type="button"
                              className="text-sm font-bold text-error transition-opacity hover:opacity-80"
                              onClick={() => openCancel(booking)}
                            >
                              Cancel
                            </button>
                          )}
                          {canReschedule && (
                            <button
                              type="button"
                              className="text-sm font-bold text-primary transition-opacity hover:opacity-80"
                              onClick={() => openReschedule(booking)}
                            >
                              Reschedule
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-sm font-bold text-primary transition-all hover:gap-2"
                        >
                          View Details
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "completed" && (
        <div className="space-y-4">
          {bookingsLoading ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-on-surface-variant">
              Loading bookings…
            </p>
          ) : bookingsError ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-error">{bookingsError}</p>
          ) : completedBookings.length === 0 ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-on-surface-variant">
              No completed bookings yet.
            </p>
          ) : (
            completedBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-white/50 bg-surface-container-lowest p-5 shadow-level-1 md:flex-row md:items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-primary">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">
                      {booking.service?.title ?? "Service Request"}
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      Completed on {formatDate(booking.scheduledAt)} • {booking.code}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 md:flex-row md:items-center md:gap-6">
                  {booking.invoice && (
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">
                        {currencyFormatter.format(Number(booking.invoice.amount))}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {booking.invoice.status === "PAID" ? "Paid" : booking.invoice.status}
                      </p>
                    </div>
                  )}
                  <ReviewAction
                    bookingId={booking.id}
                    existingReview={booking.review}
                    onSubmitted={(review) => markReviewSubmitted(booking.id, review)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "invoices" && (
        <div className="overflow-hidden rounded-3xl border border-white/50 bg-surface-container-lowest shadow-level-1">
          {invoicesLoading ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-on-surface-variant">
              Loading invoices…
            </p>
          ) : invoicesError ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-error">
              {invoicesError}
            </p>
          ) : invoices.length === 0 ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-on-surface-variant">
              No invoices yet
            </p>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 font-sans text-label-md text-primary">
                    Invoice ID
                  </th>
                  <th className="px-6 py-4 font-sans text-label-md text-primary">
                    Service Date
                  </th>
                  <th className="px-6 py-4 font-sans text-label-md text-primary">
                    Amount
                  </th>
                  <th className="px-6 py-4 font-sans text-label-md text-primary">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right font-sans text-label-md text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">
                      {invoice.number}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {formatDate(invoice.booking.scheduledAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {currencyFormatter.format(Number(invoice.amount))}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase",
                          invoice.status === "PAID"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "OVERDUE"
                              ? "bg-red-100 text-red-700"
                              : invoice.status === "VOID"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-orange-100 text-orange-700",
                        )}
                      >
                        {invoice.status === "PAID"
                          ? "Paid"
                          : invoice.status === "OVERDUE"
                            ? "Overdue"
                            : invoice.status === "VOID"
                              ? "Void"
                              : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {invoice.status === "PENDING" || invoice.status === "OVERDUE" ? (
                        <div className="inline-flex justify-end">
                          <PayNowButton
                            invoiceId={invoice.id}
                            amount={invoice.amount}
                            size="sm"
                            onPaid={() => markInvoicePaid(invoice.id)}
                          />
                        </div>
                      ) : invoice.status === "PAID" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
                          <span className="material-symbols-outlined text-sm">
                            check_circle
                          </span>
                          Paid
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
