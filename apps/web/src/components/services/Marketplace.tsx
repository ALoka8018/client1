"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@repo/ui/cn";
import { buttonClasses } from "@repo/ui/Button";

type Category = "all" | "leakage" | "waterproofing" | "inspection" | "plumbing";

const FILTERS: { key: Category; label: string; icon: string }[] = [
  { key: "all", label: "All Services", icon: "all_inclusive" },
  { key: "leakage", label: "Leakage", icon: "water_drop" },
  { key: "waterproofing", label: "Waterproofing", icon: "foundation" },
  { key: "inspection", label: "Inspection", icon: "search_check" },
  { key: "plumbing", label: "Plumbing", icon: "plumbing" },
];

const CATEGORY_LABELS: Record<Exclude<Category, "all">, string> = {
  leakage: "Leakage",
  waterproofing: "Waterproofing",
  inspection: "Inspection",
  plumbing: "Plumbing",
};

type Service = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  priceLabel: string;
  priceUnit: string | null;
  ctaType: string;
  category: { key: string; label: string; icon: string | null };
  averageRating: number;
  reviewCount: number;
};

export function Marketplace() {
  const [filter, setFilter] = useState<Category>("all");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/services`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad response"))))
      .then((data: Service[]) => {
        if (!cancelled) setServices(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load services. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visible =
    filter === "all" ? services : services.filter((item) => item.category.key === filter);

  return (
    <>
      <div className="mb-12 flex items-center gap-4 overflow-x-auto pb-4">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-2xl border px-6 py-3 font-sans text-label-md transition-all",
              filter === item.key
                ? "border-primary/10 bg-primary-container text-on-primary-container"
                : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary",
            )}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-16 text-center font-sans text-body-md text-on-surface-variant">
          Loading services…
        </p>
      ) : error ? (
        <p className="py-16 text-center font-sans text-body-md text-error">{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <div
              key={item.id}
              className="glass flex h-full flex-col rounded-3xl border border-white/50 p-6 transition-all hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative mb-6 h-48 overflow-hidden rounded-2xl bg-primary-container/10">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-primary/30">
                      {item.category.icon ?? "engineering"}
                    </span>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 shadow-sm">
                  <span
                    className="material-symbols-outlined text-sm text-secondary-container"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="font-sans text-label-md text-on-surface">
                    {item.averageRating.toFixed(1)}
                  </span>
                  {item.reviewCount > 0 && (
                    <span className="text-xs text-on-surface-variant">({item.reviewCount})</span>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="rounded-lg bg-primary/90 px-3 py-1 font-sans text-xs uppercase tracking-widest text-on-primary">
                    {CATEGORY_LABELS[item.category.key as Exclude<Category, "all">] ??
                      item.category.label}
                  </span>
                </div>
              </div>
              <h3 className="mb-2 font-display text-headline-md text-primary">{item.title}</h3>
              <p className="mb-6 line-clamp-2 font-sans text-body-md text-on-surface-variant">
                {item.description}
              </p>
              <div className="mt-auto">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs text-outline">
                      {item.priceUnit ? item.priceUnit.toUpperCase() : "PRICING"}
                    </span>
                    <span className="text-xl font-bold text-primary">{item.priceLabel}</span>
                  </div>
                  <span className="material-symbols-outlined text-outline">arrow_forward</span>
                </div>
                {item.ctaType === "dual" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/book"
                      className="rounded-xl bg-surface-container py-3 text-center font-sans text-label-md text-primary transition-colors hover:bg-primary/5"
                    >
                      Get Quote
                    </Link>
                    <Link
                      href="/book"
                      className={buttonClasses({ className: "rounded-xl", variant: "accent" })}
                    >
                      Book Now
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/book"
                    className={buttonClasses({ className: "w-full rounded-xl", variant: "primary" })}
                  >
                    Inquire Now
                  </Link>
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-col items-center justify-center rounded-3xl bg-primary p-8 text-center text-on-primary">
            <span className="material-symbols-outlined mb-4 text-5xl text-secondary-container">
              engineering
            </span>
            <h3 className="mb-4 font-display text-headline-md">Custom Technical Solution?</h3>
            <p className="mb-8 font-sans text-body-md opacity-90">
              Can&apos;t find the specific service? Our senior engineers can design a bespoke
              solution for your infrastructure.
            </p>
            <Link
              href="/book"
              className={buttonClasses({
                className: "w-full rounded-2xl",
                variant: "outline-inverse",
              })}
            >
              Consult an Expert
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
