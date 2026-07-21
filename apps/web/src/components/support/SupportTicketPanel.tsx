"use client";

import { useEffect, useState, type FormEvent } from "react";
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/Button";
import { Input, Textarea } from "@repo/ui/Input";
import { createClient } from "@/lib/supabase/client";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

type Ticket = {
  id: string;
  topic: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
};

const STATUS_META: Record<TicketStatus, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-orange-100 text-orange-700" },
  IN_PROGRESS: { label: "In Progress", className: "bg-primary-container/10 text-primary" },
  RESOLVED: { label: "Resolved", className: "bg-green-100 text-green-700" },
  CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-500" },
};

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export function SupportTicketPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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
            setTicketsError("Your session expired. Please sign in again.");
            setTicketsLoading(false);
          }
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/support-tickets`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
          if (!cancelled) setTicketsError("Could not load your tickets. Please try again.");
          return;
        }

        const data = (await res.json()) as Ticket[];
        if (!cancelled) setTickets(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setTicketsError("Could not reach the server. Please try again.");
      } finally {
        if (!cancelled) setTicketsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setSubmitError("Your session expired. Please sign in again.");
        setSubmitting(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/support-tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ topic, message }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setSubmitError(body?.error ?? "Could not submit your ticket. Please try again.");
        setSubmitting(false);
        return;
      }

      const ticket = (await res.json()) as Ticket;
      setTickets((prev) => [ticket, ...prev]);
      setTopic("");
      setMessage("");
      setSubmitted(true);
    } catch {
      setSubmitError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="glass rounded-3xl p-8">
        <h3 className="mb-6 font-display text-headline-md text-primary">
          Submit a Ticket
        </h3>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="material-symbols-outlined text-4xl text-secondary">
              check_circle
            </span>
            <p className="font-sans text-body-md text-on-surface-variant">
              Your ticket has been submitted. Our team will get back to you shortly.
            </p>
            <button
              type="button"
              className="font-sans text-label-md text-primary hover:underline"
              onClick={() => setSubmitted(false)}
            >
              Submit another ticket
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="px-1 font-sans text-label-md text-on-surface-variant">
                Topic
              </label>
              <Input
                required
                placeholder="e.g. Invoice question, Reschedule help"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="px-1 font-sans text-label-md text-on-surface-variant">
                Message
              </label>
              <Textarea
                required
                rows={4}
                placeholder="Describe your issue in detail…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            {submitError && (
              <p className="font-sans text-body-sm text-error" role="alert">
                {submitError}
              </p>
            )}
            <Button type="submit" variant="accent" disabled={submitting} fullWidth>
              {submitting ? "Submitting…" : "Submit Ticket"}
            </Button>
          </form>
        )}
      </div>

      <div>
        <h3 className="mb-4 font-display text-headline-md text-primary">Your Tickets</h3>
        <div className="overflow-hidden rounded-3xl border border-white/50 bg-surface-container-lowest shadow-level-1">
          {ticketsLoading ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-on-surface-variant">
              Loading tickets…
            </p>
          ) : ticketsError ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-error">
              {ticketsError}
            </p>
          ) : tickets.length === 0 ? (
            <p className="px-6 py-10 text-center font-sans text-body-md text-on-surface-variant">
              No tickets yet — submit one above if you need help.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/30">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="px-6 py-4">
                  <div className="mb-1 flex items-center justify-between gap-4">
                    <h4 className="font-sans text-sm font-bold text-on-surface">
                      {ticket.topic}
                    </h4>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase",
                        STATUS_META[ticket.status].className,
                      )}
                    >
                      {STATUS_META[ticket.status].label}
                    </span>
                  </div>
                  <p className="mb-1 line-clamp-2 text-sm text-on-surface-variant">
                    {ticket.message}
                  </p>
                  <p className="text-xs text-outline">{formatDate(ticket.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
