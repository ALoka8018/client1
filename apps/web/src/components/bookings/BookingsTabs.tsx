"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@repo/ui/cn";
import { createClient } from "@/lib/supabase/client";
import { PayNowButton } from "@/components/payments/PayNowButton";

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

const TABS: { key: Tab; label: string }[] = [
  { key: "active", label: "Active Bookings" },
  { key: "completed", label: "Completed" },
  { key: "invoices", label: "Invoices" },
];

const COMPLETED = [
  {
    title: "Annual Generator Service",
    detail: "Completed on Oct 12, 2024 • Tech: Sarah J.",
    amount: "$450.00",
    paidVia: "Paid via Corporate Card",
  },
  {
    title: "Lighting Upgrade (Phase 1)",
    detail: "Completed on Sept 28, 2024 • Tech: Mike V.",
    amount: "$1,280.00",
    paidVia: "Paid via PO",
  },
];

export function BookingsTabs() {
  const [tab, setTab] = useState<Tab>("active");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [invoicesFetched, setInvoicesFetched] = useState(false);

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

  const markInvoicePaid = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, status: "PAID" as const } : invoice,
      ),
    );
  };

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
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-surface-container-lowest p-6 shadow-level-1">
            <div className="absolute top-0 left-0 h-full w-1 bg-secondary" />
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-secondary-container/10 px-3 py-1 text-xs font-bold text-on-secondary-container">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                  IN PROGRESS
                </span>
                <h3 className="font-display text-headline-md text-primary">
                  HVAC System Audit
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  ID: #SLAS-88291 • West Wing Plaza
                </p>
              </div>
              <div className="text-right">
                <p className="font-sans text-label-md text-primary">
                  Arrival: 14:30 PM
                </p>
                <p className="text-xs text-on-surface-variant">Today, Oct 24</p>
              </div>
            </div>
            <div className="glass mb-6 flex items-center gap-4 rounded-2xl p-4">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqxz2YFA6uT7N4qcJYXNqXgCoP94xmh9MsWsOXBUmYRVk5EEqS0T9TRVgYNqNP8xYXJf0gkSGLTuYxvpKlRhBsYkZfOoHo4TCHUVa7ny0jVJES8JsqRwoi-gNJCV2dzQBZrp0MKH33Pxx-wSZ-aNcdVbmdUes-eWCreb0dr2lvoVEVXzKowRqo8eq5svzoafplGBGYKv_8U_4ZDSJsIPK5ydZYLWwWZzToErQseZXfHH1KV4jQjpndNz344x7V3UeYl-m4QUdigt4"
                alt="Robert Chen"
                width={56}
                height={56}
                className="h-14 w-14 rounded-full border-2 border-primary/10 object-cover"
              />
              <div className="flex-1">
                <h4 className="font-sans text-label-md text-primary">
                  Robert Chen
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Senior Mechanical Specialist
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-sm text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="text-xs font-bold">4.9</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="sms:+919876543210"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-opacity hover:opacity-80"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                </a>
                <a
                  href="tel:+919876543210"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-opacity hover:opacity-80"
                >
                  <span className="material-symbols-outlined text-lg">call</span>
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline">
                  location_on
                </span>
                <span className="text-sm text-on-surface-variant">
                  Track technician location
                </span>
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-bold text-primary transition-all hover:gap-2"
              >
                View Details
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-surface-container-lowest p-6 shadow-level-1">
            <div className="absolute top-0 left-0 h-full w-1 bg-primary" />
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary-container/10 px-3 py-1 text-xs font-bold text-on-primary-fixed-variant">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  CONFIRMED
                </span>
                <h3 className="font-display text-headline-md text-primary">
                  Fire Safety Inspection
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  ID: #SLAS-88304 • Logistics Hub A
                </p>
              </div>
              <div className="text-right">
                <p className="font-sans text-label-md text-primary">
                  Oct 26, 09:00 AM
                </p>
                <p className="text-xs text-on-surface-variant">Scheduled</p>
              </div>
            </div>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container">
                <span className="material-symbols-outlined text-2xl text-outline">
                  person
                </span>
              </div>
              <div>
                <h4 className="font-sans text-label-md text-primary">
                  Assigning Soon
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Technician will be assigned 24h before
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
              <button
                type="button"
                className="text-sm font-bold text-error transition-opacity hover:opacity-80"
              >
                Reschedule
              </button>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-bold text-primary transition-all hover:gap-2"
              >
                View Details
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "completed" && (
        <div className="space-y-4">
          {COMPLETED.map((item) => (
            <div
              key={item.title}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-white/50 bg-surface-container-lowest p-5 shadow-level-1 md:flex-row md:items-center"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-primary">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <h4 className="font-bold text-primary">{item.title}</h4>
                  <p className="text-xs text-on-surface-variant">{item.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-bold text-primary">{item.amount}</p>
                  <p className="text-xs text-on-surface-variant">{item.paidVia}</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-primary px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-on-primary"
                >
                  Rebook Service
                </button>
              </div>
            </div>
          ))}
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
