import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@repo/ui/Button";

export function Hero() {
  return (
    <section className="relative flex min-h-[795px] items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-diagnostics.jpg"
          alt="Technicians using thermal imaging and diagnostic sensors to inspect a building's plumbing infrastructure"
          fill
          priority
          className="object-cover object-right motion-safe:animate-[hero-bg-settle_12s_cubic-bezier(0.16,1,0.3,1)_forwards] motion-reduce:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      </div>

      <div className="container-max relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1 font-sans text-label-md uppercase tracking-widest text-primary motion-safe:animate-[fade-up-blur_0.7s_cubic-bezier(0.16,1,0.3,1)_backwards]">
            Precision Engineering
          </span>
          <h1 className="mb-6 font-display text-display-sm text-primary leading-[1.1] md:text-display-lg motion-safe:animate-[fade-up-blur_0.7s_cubic-bezier(0.16,1,0.3,1)_backwards] motion-safe:[animation-delay:90ms]">
            Hidden Water Leakage? <br />
            <span className="text-secondary">
              We Find It Without Breaking Your Walls.
            </span>
          </h1>
          <p className="mb-10 max-w-xl font-sans text-body-lg text-on-surface-variant motion-safe:animate-[fade-up-blur_0.7s_cubic-bezier(0.16,1,0.3,1)_backwards] motion-safe:[animation-delay:180ms]">
            Advanced Leak Detection using Acoustic Sensors, Thermal Imaging,
            and Moisture Mapping. Non-invasive, accurate, and cost-effective
            solutions for your infrastructure.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row motion-safe:animate-[fade-up-blur_0.7s_cubic-bezier(0.16,1,0.3,1)_backwards] motion-safe:[animation-delay:270ms]">
            <Link
              href="/book"
              className={buttonClasses({ variant: "accent", size: "lg" })}
            >
              Book Inspection
              <span className="material-symbols-outlined">
                calendar_today
              </span>
            </Link>
            <a
              href="tel:+916742304500"
              className={buttonClasses({ variant: "outline", size: "lg" })}
            >
              Call Now
              <span className="material-symbols-outlined">call</span>
            </a>
          </div>
        </div>

        {/* Reserved for a future hero side image */}
        <div className="hidden lg:block" />
      </div>
    </section>
  );
}
