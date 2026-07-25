import type { Metadata } from "next";
import { buildMetadata } from "@repo/seo";
import { Badge } from "@repo/ui/Badge";
import { CtaBanner } from "@/components/services/CtaBanner";

export const metadata: Metadata = buildMetadata("https://example.com", {
  title: "How It Works | Seepage Leakage All Solutions",
  description:
    "The full flow of the Seepage Leakage All Solutions platform — from first visit to a booked survey — plus what's live today and what's next.",
  path: "/docs/flow",
});

const JOURNEY = [
  {
    icon: "travel_explore",
    stage: "Step 1",
    title: "Discover",
    description:
      "A visitor lands on the site and reads about the diagnostic process and past results.",
  },
  {
    icon: "storefront",
    stage: "Step 2",
    title: "Explore services",
    description:
      "Browses the service catalog — leak detection, waterproofing, inspections — with pricing shown upfront.",
  },
  {
    icon: "person_add",
    stage: "Step 3",
    title: "Create an account",
    description:
      "Signs up or logs in securely. A dedicated identity provider handles this in the background.",
  },
  {
    icon: "event_available",
    stage: "Step 4",
    title: "Book a survey",
    description:
      "Fills in property details, city, and preferred date. One submit creates the job in the system.",
  },
  {
    icon: "mark_email_read",
    stage: "Step 5",
    title: "Confirmation",
    description:
      "Sees an on-screen confirmation and receives an automatic email — no staff involvement needed.",
  },
] as const;

const FEATURES = [
  {
    title: "Marketing website",
    description:
      "Home, services, projects, about, blog, careers, contact, safety standards, and legal pages — fully designed and live.",
    status: "ready",
  },
  {
    title: "Service marketplace",
    description:
      "Filterable catalog of services with pricing and calls-to-action — Book Now, Get Quote, Inquire.",
    status: "ready",
  },
  {
    title: "Online booking",
    description:
      "Customers request a survey with property and contact details; the job is created instantly with a tracking code.",
    status: "ready",
  },
  {
    title: "Customer accounts",
    description:
      "Secure sign-up and login, session handling, and password recovery via a trusted identity provider.",
    status: "ready",
  },
  {
    title: "Automated emails",
    description: "Booking confirmations send automatically the moment a request is submitted.",
    status: "ready",
  },
  {
    title: "Customer dashboard",
    description:
      "Designed screens for job status, property history, and maintenance records — needs live data wired in.",
    status: "planned",
  },
  {
    title: "Invoicing & payments",
    description:
      "The database already records invoices and payment references — the checkout screen is the remaining step.",
    status: "planned",
  },
  {
    title: "Technician assignment",
    description:
      "The data model supports assigning a technician to a job and tracking status changes end to end.",
    status: "planned",
  },
  {
    title: "Admin control panel",
    description:
      "A placeholder page is reserved for staff to manage bookings, technicians, and content.",
    status: "planned",
  },
] as const;

const SITEMAP = [
  {
    heading: "Public — no account needed",
    pages: [
      "Home",
      "Services",
      "Services · Explore (marketplace)",
      "Projects",
      "About",
      "Blog",
      "Careers",
      "Contact",
      "Safety Standards",
      "Privacy & Terms",
      "Log in / Sign up",
    ],
  },
  {
    heading: "Customer account — sign-in required",
    pages: ["Book a Survey", "Dashboard", "My Bookings", "My Account", "Support", "Admin (staff only)"],
  },
] as const;

const FOUNDATION = [
  {
    icon: "verified_user",
    title: "Bank-grade login",
    description: "Session security handled by a dedicated identity provider, not custom code.",
  },
  {
    icon: "cloud_done",
    title: "Cloud-hosted",
    description: "The website and booking system run on managed infrastructure, not a single server.",
  },
  {
    icon: "database",
    title: "One database",
    description: "Every customer, property, job, and invoice lives in one structured record.",
  },
  {
    icon: "extension",
    title: "Built to extend",
    description: "Payments, technician assignment, and admin tools are scoped additions, not rebuilds.",
  },
] as const;

const ROADMAP = [
  {
    order: "Next",
    title: "Connect the customer dashboard",
    description: "Wire real booking data in so customers can track job status themselves.",
  },
  {
    order: "Next",
    title: "Turn on payments",
    description: "Checkout and invoice generation, on top of the database fields already in place.",
  },
  {
    order: "Later",
    title: "Technician workflow",
    description: "Assigning jobs, status updates from the field, and a technician-facing view.",
  },
  {
    order: "Later",
    title: "Admin control panel",
    description: "A staff dashboard for managing bookings, technicians, and site content.",
  },
] as const;

export default function FlowDocsPage() {
  return (
    <>
      <section className="pt-section-mobile md:pt-section-desktop">
        <div className="container-max text-center">
          <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1 font-sans text-label-md uppercase tracking-widest text-primary">
            How It Works
          </span>
          <h1 className="mx-auto mb-6 max-w-3xl font-display text-display-sm text-primary md:text-display-lg">
            From first visit to a booked technician.
          </h1>
          <p className="mx-auto max-w-2xl font-sans text-body-lg text-on-surface-variant">
            This page maps the whole platform in one place — the path every customer
            takes, what&apos;s live today, and what a new owner would build next.
          </p>
        </div>
      </section>

      {/* Customer journey */}
      <section className="mt-section-mobile md:mt-section-desktop">
        <div className="container-max">
          <h2 className="mb-3 font-display text-headline-md text-primary">
            The customer journey
          </h2>
          <p className="mb-10 max-w-2xl font-sans text-body-md text-on-surface-variant">
            Five steps, live on the site today — no manual work required until a
            technician needs to be assigned.
          </p>
          <div className="grid gap-4 md:grid-cols-5">
            {JOURNEY.map((step) => (
              <div
                key={step.title}
                className="rounded-xl bg-surface-container-lowest p-6 shadow-level-1"
              >
                <span
                  className="material-symbols-outlined mb-4 block text-3xl text-secondary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {step.icon}
                </span>
                <div className="mb-1 font-sans text-label-md uppercase tracking-wide text-on-surface-variant">
                  {step.stage}
                </div>
                <h3 className="mb-2 font-display text-base font-semibold text-primary-container">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-on-surface-variant">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature status grid */}
      <section className="mt-section-mobile md:mt-section-desktop border-y border-outline-variant/30 bg-surface-container-low py-section-mobile md:py-section-desktop">
        <div className="container-max">
          <h2 className="mb-3 font-display text-headline-md text-primary">
            What&apos;s in the box
          </h2>
          <p className="mb-10 max-w-2xl font-sans text-body-md text-on-surface-variant">
            &ldquo;Ready&rdquo; means it works live today. &ldquo;Planned&rdquo; means the
            design and database groundwork already exists — it&apos;s a scoped build,
            not a redesign.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-surface-container-lowest p-6 shadow-level-1"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="font-display text-base font-semibold text-primary-container">
                    {feature.title}
                  </h3>
                  <Badge variant={feature.status === "ready" ? "primary" : "neutral"}>
                    {feature.status === "ready" ? "Ready" : "Planned"}
                  </Badge>
                </div>
                <p className="font-sans text-sm text-on-surface-variant">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Site map */}
      <section className="mt-section-mobile md:mt-section-desktop">
        <div className="container-max">
          <h2 className="mb-3 font-display text-headline-md text-primary">
            Every page, at a glance
          </h2>
          <p className="mb-10 max-w-2xl font-sans text-body-md text-on-surface-variant">
            Two tiers: public pages anyone can browse, and account pages only a
            signed-in customer sees.
          </p>
          <div className="grid gap-10 md:grid-cols-2">
            {SITEMAP.map((column) => (
              <div key={column.heading}>
                <h3 className="mb-4 border-b border-outline-variant/40 pb-3 font-sans text-label-md uppercase tracking-wide text-on-surface-variant">
                  {column.heading}
                </h3>
                <ul>
                  {column.pages.map((page) => (
                    <li
                      key={page}
                      className="border-b border-dashed border-outline-variant/40 py-3 font-sans text-body-md text-on-surface last:border-none"
                    >
                      {page}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Foundation */}
      <section className="mt-section-mobile md:mt-section-desktop border-y border-outline-variant/30 bg-surface-container-low py-12">
        <div className="container-max">
          <h2 className="mb-8 font-display text-headline-md text-primary">
            The foundation underneath
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FOUNDATION.map((item) => (
              <div key={item.title} className="border-t-2 border-secondary-container pt-4">
                <span
                  className="material-symbols-outlined mb-2 block text-2xl text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
                <h3 className="mb-1 font-display text-base font-semibold text-primary-container">
                  {item.title}
                </h3>
                <p className="font-sans text-sm text-on-surface-variant">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="mt-section-mobile md:mt-section-desktop">
        <div className="container-max">
          <h2 className="mb-3 font-display text-headline-md text-primary">
            What&apos;s next
          </h2>
          <p className="mb-10 max-w-2xl font-sans text-body-md text-on-surface-variant">
            Ordered by what unlocks the most value first.
          </p>
          <div className="flex flex-col gap-3">
            {ROADMAP.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-5 shadow-level-1 sm:flex-row sm:items-center"
              >
                <Badge variant="neutral" className="shrink-0">
                  {item.order}
                </Badge>
                <p className="font-sans text-sm text-on-surface-variant">
                  <span className="font-semibold text-primary">{item.title}.</span>{" "}
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        title="See it working end to end."
        description="Book a survey yourself and follow the exact flow a real customer takes, from request to confirmation."
        primaryLabel="Book a Survey"
        primaryHref="/book"
        secondaryLabel="Explore Services"
        secondaryHref="/services"
      />
    </>
  );
}
