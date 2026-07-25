import { SupportTicketPanel } from "@/components/support/SupportTicketPanel";

const TOPICS = [
  {
    icon: "calendar_today",
    title: "Managing Bookings",
    description: "Reschedule, cancel, or track an active technician visit.",
  },
  {
    icon: "receipt_long",
    title: "Invoices & Payments",
    description: "Download past invoices or update your payment method.",
  },
  {
    icon: "verified",
    title: "Warranty Claims",
    description: "Check coverage or file a claim on completed repair work.",
  },
];

export default function SupportPage() {
  return (
    <div className="container-max py-section-mobile md:py-section-desktop">
      <div className="mb-12 text-center">
        <h1 className="mb-4 font-display text-headline-lg-mobile text-primary md:text-headline-lg">
          Support Center
        </h1>
        <p className="mx-auto max-w-xl font-sans text-body-md text-on-surface-variant">
          Answers to the most common account and service questions. Can&apos;t
          find what you need? Reach us directly.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-gutter sm:grid-cols-3">
        {TOPICS.map((topic) => (
          <div
            key={topic.title}
            className="glass rounded-3xl p-8 text-center"
          >
            <span className="material-symbols-outlined mb-4 text-4xl text-primary">
              {topic.icon}
            </span>
            <h3 className="mb-2 font-display text-headline-md text-primary-container">
              {topic.title}
            </h3>
            <p className="font-sans text-body-md text-on-surface-variant">
              {topic.description}
            </p>
          </div>
        ))}
      </div>

      <div className="glass mx-auto max-w-xl rounded-3xl p-8 text-center">
        <h3 className="mb-2 font-display text-headline-md text-primary-container">
          Still stuck?
        </h3>
        <p className="mb-4 font-sans text-body-md text-on-surface-variant">
          Call our expert line at{" "}
          <a href="tel:+916742304500" className="font-semibold text-primary">
            +91 674 230 4500
          </a>{" "}
          or email{" "}
          <a
            href="mailto:solutions@aiasengineering.com"
            className="font-semibold text-primary"
          >
            solutions@aiasengineering.com
          </a>
          .
        </p>
      </div>

      <div className="mt-12">
        <SupportTicketPanel />
      </div>
    </div>
  );
}
