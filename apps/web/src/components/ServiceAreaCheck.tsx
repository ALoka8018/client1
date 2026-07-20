"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@repo/ui/cn";
import { Badge } from "@repo/ui/Badge";
import { buttonClasses } from "@repo/ui/Button";
import { SERVICE_AREAS, checkServiceArea } from "@/lib/serviceAreas";

const OTHER = "__other__";

export function ServiceAreaCheck({ className }: { className?: string }) {
  const [city, setCity] = useState("");

  const result = city && city !== OTHER ? checkServiceArea(city) : null;
  const showOtherResult = city === OTHER;

  return (
    <div className={cn("glass rounded-3xl border border-white/50 p-6 md:p-8", className)}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container/10">
          <span className="material-symbols-outlined text-primary">location_on</span>
        </div>
        <div>
          <h3 className="font-display text-headline-sm text-primary">
            Check service coverage in your area
          </h3>
          <p className="font-sans text-body-sm text-on-surface-variant">
            We currently serve four cities across Odisha.
          </p>
        </div>
      </div>

      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/20"
      >
        <option value="">Select your city</option>
        {SERVICE_AREAS.map((area) => (
          <option key={area.city} value={area.city}>
            {area.city}
          </option>
        ))}
        <option value={OTHER}>Somewhere else</option>
      </select>

      {result && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-primary/5 p-4">
          <div>
            <Badge variant="primary">We&apos;re active here</Badge>
            <p className="mt-2 font-sans text-body-sm text-on-surface-variant">
              {result.responseTimeLabel}
            </p>
          </div>
          <Link href="/book" className={buttonClasses({ variant: "accent", size: "sm" })}>
            Book Now
          </Link>
        </div>
      )}

      {showOtherResult && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-error-container/40 p-4">
          <div>
            <Badge variant="error">Not yet in this area</Badge>
            <p className="mt-2 font-sans text-body-sm text-on-surface-variant">
              We&apos;re expanding beyond Bhubaneswar, Cuttack, Puri, and Rourkela — book anyway
              and our team will confirm reach.
            </p>
          </div>
          <Link href="/book" className={buttonClasses({ variant: "outline", size: "sm" })}>
            Book Anyway
          </Link>
        </div>
      )}
    </div>
  );
}
