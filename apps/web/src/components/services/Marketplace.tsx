"use client";

import { useState } from "react";
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

const LISTINGS: {
  title: string;
  description: string;
  category: Exclude<Category, "all">;
  rating: number;
  priceLabel: string;
  price: string;
  image: string;
  cta: "dual" | "inquire";
}[] = [
  {
    title: "Acoustic Leak Detection",
    description:
      "Pinpoint non-destructive leak identification using advanced ultrasonic sensors and professional thermal imaging.",
    category: "leakage",
    rating: 4.9,
    priceLabel: "STARTING FROM",
    price: "₹2,499",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2cvBFasDdKMlteKDMFmJhKvTm-cNmok6k105j2p03aRVWyF3H3kMEjIdsIXz2fKZn-QLGIQfhQYgg8ZrOEYTWgb6Mytmg5Mn3twYklL1SC4_6Zg3fKHYKoB-z2-NKTlLyu84CgD8u2mqnTrWordIvXceQe3FQPbaxnLwxfsfh1Zdsr5GqdjjdytxDYWPHbTNfPZ9rmRqI606OMcxOyA-PqlSe_veRDbRZWOUM7MYygOJzg0-GzXnwI60yWVkzqpgOszzNxwAxf1k",
    cta: "dual",
  },
  {
    title: "Polyurethane Membrane",
    description:
      "Industrial-grade seamless liquid membrane application for rooftops and terrace gardens. 10-year warranty guaranteed.",
    category: "waterproofing",
    rating: 4.7,
    priceLabel: "ESTIMATED PRICE",
    price: "₹149/sqft",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB0w78tDhXtgBEf5Hkanf9jGSyabulTFy48aYpF3eOUrd2a3OTfqPSR4D6RcN1b2Poh-Op0pojSYt37b7LeSTX3mZ37drmVNo0xR8l3QNpOOEKtvCmVYesOToYqwM-lCQCSi18fvKeTjUoVXAeLRABkTpFYDReEkC0yDR8wSdxDtplfCIIERqlakqRhLTQhEoi4q_jyhG3N1HQACCgbG628Rs9J9AgT2EEgqUbYeQZBj7aMyiqEc_WakBzuadMwEV96SlMv-gQLJd0",
    cta: "dual",
  },
  {
    title: "Structural Integrity Audit",
    description:
      "Comprehensive health check for commercial buildings, including NDT tests and detailed structural reports.",
    category: "inspection",
    rating: 5.0,
    priceLabel: "STARTING FROM",
    price: "₹9,999",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBoB3lSlC7v3NL7barUwJmGv9z1kLd_16TeQsW6IVeolabKuAlBgb9OvtMAWShbFXpZ5GUxvi7W5RJ3KI5xLyjyCypHOeSBhDMFYzVPQ-LHb58W1cZdtKM1Ry-_3wpR3giYQSat3swldhpYdtaRTRyFwu4BjL7VC7W_FzbrP7ISyA6t4lgMtjFkFKx6vB6D8JZBZSbFeZVB4cOXZ-UizO3a5uh-OmxC2yX2geF-Jv6s308eLV5B0wAJat5f-MrtJqpmucOmz0i_Hzs",
    cta: "inquire",
  },
  {
    title: "Smart Pipeline Cleaning",
    description:
      "Eco-friendly high-pressure hydro-jetting for blocked industrial and residential drainage systems.",
    category: "plumbing",
    rating: 4.8,
    priceLabel: "STARTING FROM",
    price: "₹999",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBBoNddp_kuIFhTPMLLIRqnCY1cohcz8q7vXsOeQh6WR2BEzkWiT8prYAahD_8HK4Fm7idVTvcqzsjYw-LzCGepfOfoSq1RblLUJHsC-iUR-c0TtXIEll8s7R8CST7S_bJ6FIUcN5x5LDtVNw59KUZ7MkTzZl6Kl1GVQKCtarTG1AvY7tQbAhL1JbvhuVhE49ySNwHRZHNFOOLe_M154ONTuo10fC2bc5R_IjPEzXUgkBtQK3rTPi0G4nhIGpDHl9uIC-ZJz33irXE",
    cta: "dual",
  },
  {
    title: "Basement Injection Grouting",
    description:
      "Negative-side waterproofing for basements using specialized chemical resin injection systems.",
    category: "waterproofing",
    rating: 4.9,
    priceLabel: "STARTING FROM",
    price: "₹12,500",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDzq4-LY2drj-tmOYPcPvur6zne9omq28lHjwdLigNZyFxrogpkw5WzYsu9AaOzYS0s3hjzxr3lom67prmMaktoB19IcxaUaPmJcE281nVENI2gz33Ua6XPHWpoJkN3j9Dg5wLYutuPiklWgaWaVLXSJhQtcfsawhqH5PRvx39tBLsk2qTQQzoTSbjvX2HdIKDO-GYQUDDEhCvMffiVEnIVF8zcuW7wR01l0vCkBvueLqUTLCFfBA1nzlC5UAurvKRCQ7wzWpUle4E",
    cta: "dual",
  },
];

const CATEGORY_LABELS: Record<Exclude<Category, "all">, string> = {
  leakage: "Leakage",
  waterproofing: "Waterproofing",
  inspection: "Inspection",
  plumbing: "Plumbing",
};

export function Marketplace() {
  const [filter, setFilter] = useState<Category>("all");
  const visible =
    filter === "all"
      ? LISTINGS
      : LISTINGS.filter((item) => item.category === filter);

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

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <div
            key={item.title}
            className="glass flex h-full flex-col rounded-3xl border border-white/50 p-6 transition-all hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="relative mb-6 h-48 overflow-hidden rounded-2xl">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
              <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 shadow-sm">
                <span
                  className="material-symbols-outlined text-sm text-secondary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="font-sans text-label-md text-on-surface">
                  {item.rating.toFixed(1)}
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="rounded-lg bg-primary/90 px-3 py-1 font-sans text-xs uppercase tracking-widest text-on-primary">
                  {CATEGORY_LABELS[item.category]}
                </span>
              </div>
            </div>
            <h3 className="mb-2 font-display text-headline-md text-primary">
              {item.title}
            </h3>
            <p className="mb-6 line-clamp-2 font-sans text-body-md text-on-surface-variant">
              {item.description}
            </p>
            <div className="mt-auto">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-sans text-xs text-outline">
                    {item.priceLabel}
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {item.price}
                  </span>
                </div>
                <span className="material-symbols-outlined text-outline">
                  arrow_forward
                </span>
              </div>
              {item.cta === "dual" ? (
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
          <h3 className="mb-4 font-display text-headline-md">
            Custom Technical Solution?
          </h3>
          <p className="mb-8 font-sans text-body-md opacity-90">
            Can&apos;t find the specific service? Our senior engineers can
            design a bespoke solution for your infrastructure.
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
    </>
  );
}
