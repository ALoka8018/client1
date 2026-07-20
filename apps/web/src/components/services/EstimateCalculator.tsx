"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@repo/ui/Button";

type Service = {
  id: string;
  title: string;
  priceAmount: string;
};

type PropertySize = "small" | "medium" | "large";
type Severity = "mild" | "moderate" | "severe";

const SIZE_OPTIONS: { value: PropertySize; label: string; multiplier: number }[] = [
  { value: "small", label: "Small (1 room / < 500 sq.ft)", multiplier: 0.8 },
  { value: "medium", label: "Medium (apartment / 500–1500 sq.ft)", multiplier: 1 },
  { value: "large", label: "Large (house / commercial / > 1500 sq.ft)", multiplier: 1.5 },
];

const SEVERITY_OPTIONS: { value: Severity; label: string; multiplier: number }[] = [
  { value: "mild", label: "Mild — early signs, no visible damage", multiplier: 0.9 },
  { value: "moderate", label: "Moderate — visible dampness or staining", multiplier: 1 },
  { value: "severe", label: "Severe — active leak or structural damage", multiplier: 1.35 },
];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function EstimateCalculator() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [size, setSize] = useState<PropertySize>("medium");
  const [severity, setSeverity] = useState<Severity>("moderate");

  useEffect(() => {
    let cancelled = false;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/services`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad response"))))
      .then((data: Service[]) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setServices(list);
        if (list.length > 0) setServiceId(list[0]!.id);
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedService = services.find((s) => s.id === serviceId);
  const sizeMultiplier = SIZE_OPTIONS.find((o) => o.value === size)?.multiplier ?? 1;
  const severityMultiplier = SEVERITY_OPTIONS.find((o) => o.value === severity)?.multiplier ?? 1;

  const estimate = selectedService
    ? Number(selectedService.priceAmount) * sizeMultiplier * severityMultiplier
    : null;

  const low = estimate !== null ? estimate * 0.85 : null;
  const high = estimate !== null ? estimate * 1.15 : null;

  const fieldClasses =
    "w-full rounded-2xl border-none bg-surface-container-low px-6 py-4 font-sans text-on-surface outline-none transition-all focus:ring-2 focus:ring-primary/20 appearance-none";

  return (
    <section className="glass mb-12 rounded-3xl border border-white/50 p-8 md:p-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container">
          <span className="material-symbols-outlined">calculate</span>
        </div>
        <div>
          <h2 className="font-display text-headline-md text-primary">Instant Estimate</h2>
          <p className="font-sans text-body-md text-on-surface-variant">
            Get a rough price range before booking a full inspection.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <label className="px-1 font-sans text-label-md text-on-surface-variant">
            Service Type
          </label>
          <select
            className={fieldClasses}
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            disabled={services.length === 0}
          >
            {services.length === 0 ? (
              <option>Loading services…</option>
            ) : (
              services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label className="px-1 font-sans text-label-md text-on-surface-variant">
            Property Size
          </label>
          <select
            className={fieldClasses}
            value={size}
            onChange={(e) => setSize(e.target.value as PropertySize)}
          >
            {SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="px-1 font-sans text-label-md text-on-surface-variant">
            Leak Severity
          </label>
          <select
            className={fieldClasses}
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
          >
            {SEVERITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {low !== null && high !== null && (
        <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-2xl bg-primary/5 p-6 md:flex-row">
          <div>
            <p className="font-sans text-xs text-outline uppercase">Estimated Range</p>
            <p className="font-display text-headline-md text-primary">
              {currencyFormatter.format(low)} – {currencyFormatter.format(high)}
            </p>
            <p className="mt-1 max-w-md font-sans text-body-sm text-on-surface-variant">
              A starting-from estimate, not a final quote — an engineer confirms exact pricing
              after inspection.
            </p>
          </div>
          <Link href="/book" className={buttonClasses({ variant: "accent", className: "shrink-0" })}>
            Book an Inspection
          </Link>
        </div>
      )}
    </section>
  );
}
