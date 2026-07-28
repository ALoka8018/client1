"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { cn } from "@repo/ui/cn";
import { Badge } from "@repo/ui/Badge";
import { buttonClasses } from "@repo/ui/Button";

type CheckResult = { available: boolean; city?: string; area?: string };

export function ServiceAreaCheck({ className }: { className?: string }) {
  const [pincode, setPincode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const handleCheck = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setChecking(true);
    setResult(null);
    setLeadSubmitted(false);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/service-areas/check?pincode=${encodeURIComponent(pincode)}`,
      );
      setResult(res.ok ? await res.json() : { available: false });
    } catch {
      setResult({ available: false });
    } finally {
      setChecking(false);
    }
  };

  const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLeadError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: leadName, phone: leadPhone, area: pincode }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setLeadError(body?.error ?? "Could not submit. Please try again.");
        return;
      }

      setLeadSubmitted(true);
    } catch {
      setLeadError("Could not reach the server. Please try again.");
    }
  };

  return (
    <div className={cn("glass rounded-3xl border border-white/50 p-6 md:p-8", className)}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container/10">
          <span className="material-icon text-primary">location_on</span>
        </div>
        <div>
          <h3 className="font-display text-headline-sm text-primary-container">
            Check service coverage in your area
          </h3>
          <p className="font-sans text-body-sm text-on-surface-variant">
            Enter your pincode to check availability.
          </p>
        </div>
      </div>

      <form className="flex gap-3" onSubmit={handleCheck}>
        <input
          required
          inputMode="numeric"
          placeholder="e.g. 751001"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          className="h-14 w-full min-w-0 rounded-2xl border-none bg-surface-container-low px-5 font-sans text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={checking}
          className={buttonClasses({
            variant: "accent",
            size: "lg",
            className: "shrink-0 rounded-2xl px-5",
          })}
        >
          {checking ? "Checking…" : "Check"}
        </button>
      </form>

      {result?.available && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-primary/5 p-4">
          <div>
            <Badge variant="primary">We&apos;re active here</Badge>
            <p className="mt-2 font-sans text-body-sm text-on-surface-variant">
              Serving {result.area ?? result.city}.
            </p>
          </div>
          <Link href="/book" className={buttonClasses({ variant: "accent", size: "sm" })}>
            Book Now
          </Link>
        </div>
      )}

      {result && !result.available && (
        <div className="mt-5 rounded-2xl bg-error-container/40 p-4">
          <Badge variant="error">Not yet in this area</Badge>
          <p className="mt-2 font-sans text-body-sm text-on-surface-variant">
            We&apos;re expanding beyond our current service areas. Leave your details and
            we&apos;ll reach out when we cover your area.
          </p>

          {leadSubmitted ? (
            <p className="mt-4 font-sans text-body-sm font-semibold text-primary">
              Thanks! We&apos;ll be in touch as soon as we&apos;re available in your area.
            </p>
          ) : (
            <form className="mt-4 space-y-3" onSubmit={handleLeadSubmit}>
              <input
                required
                placeholder="Your name"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-3 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                required
                type="tel"
                placeholder="Phone number"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-3 font-sans text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              />
              {leadError && (
                <p className="font-sans text-body-sm text-error" role="alert">
                  {leadError}
                </p>
              )}
              <button type="submit" className={buttonClasses({ variant: "outline", size: "sm" })}>
                Notify me when available
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
