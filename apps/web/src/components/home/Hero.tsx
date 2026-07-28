import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@repo/ui/Button";

const scanSteps = [
  { n: "01", label: "Pipeline & wall scanning" },
  { n: "02", label: "Drain endoscopy" },
  { n: "03", label: "Moisture patch mapping" },
  { n: "04", label: "Seepage & waterproof repair" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[600px] items-center overflow-hidden py-12 lg:min-h-[795px] lg:py-0">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-diagnostics.jpg"
          alt="Technicians using thermal imaging and diagnostic sensors to inspect a building's plumbing infrastructure"
          fill
          priority
          className="object-cover object-right motion-safe:animate-[hero-bg-settle_12s_cubic-bezier(0.16,1,0.3,1)_forwards,hero-bg-pulse_8s_ease-in-out_12s_infinite] motion-reduce:scale-105"
        />
        {/* Mobile stacks text over the full image, so the wash has to cover the
            whole frame; from lg: the copy sits in the left column only. */}
        <div className="absolute inset-0 bg-background/85 lg:bg-transparent lg:bg-gradient-to-r lg:from-background lg:via-background/70 lg:to-transparent" />
      </div>

      <div className="container-max relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1 font-sans text-label-md uppercase tracking-widest text-primary motion-safe:animate-[fade-up-blur_0.7s_cubic-bezier(0.16,1,0.3,1)_backwards]">
            Precision Engineering
          </span>
          <h1
            className="mb-6 text-display-sm leading-[0.95] tracking-tight text-primary md:text-display-lg motion-safe:animate-[fade-up-blur_0.7s_cubic-bezier(0.16,1,0.3,1)_backwards] motion-safe:[animation-delay:90ms]"
            style={{ fontFamily: "var(--font-archivo)", fontWeight: 800 }}
          >
            Hidden Water Leakage? <br />
            <span className="text-secondary">
              We Find It Without Breaking Your Walls.
            </span>
          </h1>
          <p className="mb-6 max-w-xl font-sans text-body-lg text-on-surface-variant motion-safe:animate-[fade-up-blur_0.7s_cubic-bezier(0.16,1,0.3,1)_backwards] motion-safe:[animation-delay:180ms]">
            Advanced Leak Detection using Acoustic Sensors, Thermal Imaging,
            and Moisture Mapping. Non-invasive, accurate, and cost-effective
            solutions for your infrastructure.
          </p>
          <div className="mb-10 grid grid-cols-1 border-t border-outline-variant sm:grid-cols-2 motion-safe:animate-[fade-up-blur_0.7s_cubic-bezier(0.16,1,0.3,1)_backwards] motion-safe:[animation-delay:220ms]">
            {scanSteps.map((step, i) => (
              <div
                key={step.n}
                className={`flex gap-3 border-b border-outline-variant py-3 ${
                  i % 2 === 0
                    ? "sm:pr-4"
                    : "sm:border-l sm:border-outline-variant sm:pl-4"
                }`}
              >
                <span className="font-sans text-label-md font-bold text-secondary">
                  {step.n}
                </span>
                <span className="font-sans text-body-sm tracking-wide text-on-surface-variant">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row motion-safe:animate-[fade-up-blur_0.7s_cubic-bezier(0.16,1,0.3,1)_backwards] motion-safe:[animation-delay:270ms]">
            <Link
              href="/book"
              className={buttonClasses({ variant: "accent", size: "lg" })}
            >
              Book Inspection
              <span className="material-icon">
                calendar_today
              </span>
            </Link>
            <a
              href="tel:+916742304500"
              className={buttonClasses({ variant: "outline", size: "lg" })}
            >
              Call Now
              <span className="material-icon">call</span>
            </a>
          </div>
        </div>

        <div
          className="hidden lg:block motion-safe:animate-[fade-up-blur_0.8s_cubic-bezier(0.16,1,0.3,1)_backwards] motion-safe:[animation-delay:360ms]"
          style={{ ["--scan" as string]: "4s" }}
        >
          <div className="glass rounded-3xl border border-white/40 p-4 shadow-level-2">
            <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl bg-primary shadow-inner">
              <div className="flex items-center justify-between gap-3 border-b border-on-primary/15 px-4 py-3">
                <span className="font-sans text-[10px] font-bold tracking-[0.22em] text-on-primary-container">
                  MOISTURE RADAR &mdash; GROUND FLOOR
                </span>
                <span className="flex items-center gap-2 font-sans text-[10px] font-bold tracking-[0.18em] text-tertiary-container">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary-container motion-safe:animate-[blink-dot_1s_step-end_infinite]" />
                  SWEEPING
                </span>
              </div>

              <div className="flex flex-1 items-center justify-center overflow-hidden p-2">
                <svg viewBox="0 0 440 440" className="h-full w-full">
                  <defs>
                    <linearGradient id="hero-radar-wedge" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ff6d00" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#ff6d00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <g stroke="#3c096c" strokeWidth="1.5" fill="none">
                    <path d="M220 20V420M20 220H420" />
                    <path d="M78 78L362 362M362 78L78 362" />
                  </g>
                  <g fill="none" stroke="#5a189a" strokeWidth="2">
                    <circle cx="220" cy="220" r="60" />
                    <circle cx="220" cy="220" r="120" />
                    <circle cx="220" cy="220" r="180" />
                  </g>
                  <g
                    style={{ transformOrigin: "220px 220px" }}
                    className="motion-safe:animate-[radar-spin_var(--scan)_linear_infinite]"
                  >
                    <path
                      d="M220 220L400 220A180 180 0 0 0 348 93Z"
                      fill="url(#hero-radar-wedge)"
                    />
                    <path d="M220 220L400 220" stroke="#ff9100" strokeWidth="2.5" />
                  </g>
                  <g className="motion-safe:animate-[radar-blip_var(--scan)_linear_infinite]">
                    <circle
                      cx="126"
                      cy="232"
                      r="7"
                      fill="#ff6d00"
                      style={{ transformOrigin: "126px 232px" }}
                    />
                  </g>
                  <g
                    className="motion-safe:animate-[radar-blip_var(--scan)_linear_infinite]"
                    style={{ animationDelay: "0.9s" }}
                  >
                    <circle
                      cx="152"
                      cy="296"
                      r="6"
                      fill="#ff9e00"
                      style={{ transformOrigin: "152px 296px" }}
                    />
                  </g>
                  <g
                    className="motion-safe:animate-[radar-blip_var(--scan)_linear_infinite]"
                    style={{ animationDelay: "1.8s" }}
                  >
                    <circle
                      cx="256"
                      cy="316"
                      r="5"
                      fill="#ff9100"
                      style={{ transformOrigin: "256px 316px" }}
                    />
                  </g>
                  <circle
                    cx="126"
                    cy="232"
                    r="7"
                    fill="none"
                    stroke="#ff6d00"
                    strokeWidth="2"
                    style={{ transformOrigin: "126px 232px" }}
                    className="motion-safe:animate-[radar-ring_2s_ease-out_infinite]"
                  />
                  <circle cx="220" cy="220" r="6" fill="#9d4edd" />
                  <g className="motion-safe:animate-[fade-up-blur_0.7s_cubic-bezier(0.16,1,0.3,1)_backwards] motion-safe:[animation-delay:1.3s]">
                    <path d="M133 224L70 168" stroke="#ff9e00" strokeWidth="1.5" />
                    <rect
                      x="20"
                      y="116"
                      width="184"
                      height="52"
                      fill="#240046"
                      stroke="#7b2cbf"
                      strokeWidth="2"
                    />
                    <rect x="20" y="116" width="5" height="52" fill="#ff6d00" />
                    <text
                      x="38"
                      y="140"
                      fontFamily="var(--font-archivo)"
                      fontSize="13"
                      fontWeight="800"
                      letterSpacing="1.2"
                      fill="#f6f0ff"
                    >
                      SEEPAGE FOUND
                    </text>
                    <text
                      x="38"
                      y="158"
                      fontSize="11"
                      fontWeight="500"
                      fill="#c79bf0"
                    >
                      2.4 m &middot; behind wall &middot; joint
                    </text>
                  </g>
                </svg>
              </div>

              <div className="grid grid-cols-[auto_1fr] items-end gap-4 border-t border-on-primary/15 px-4 py-3">
                <div>
                  <div className="text-2xl leading-none font-extrabold text-tertiary-container">
                    78%
                  </div>
                  <div className="mt-1.5 font-sans text-[10px] tracking-[0.18em] text-on-primary-container">
                    MOISTURE LEVEL
                  </div>
                </div>
                <div className="flex h-11 items-end gap-1">
                  {[
                    "#7b2cbf",
                    "#9d4edd",
                    "#ff9e00",
                    "#ff9100",
                    "#ff6d00",
                    "#ff8500",
                    "#9d4edd",
                    "#7b2cbf",
                  ].map((color, i) => (
                    <span
                      key={color + i}
                      className="h-full flex-1 origin-bottom motion-safe:animate-[bar-pulse_1.6s_ease-in-out_infinite]"
                      style={{ background: color, animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
