import { ContactDetails } from "@/components/book/ContactDetails";
import { ServiceZoneMap } from "@/components/book/ServiceZoneMap";

export default function ContactPage() {
  return (
    <section className="py-section-mobile md:py-section-desktop">
      <div className="container-max">
        <div className="mb-16 text-center">
          <h1 className="mx-auto mb-6 max-w-2xl font-display text-headline-md text-primary md:text-display-lg">
            Talk to an Engineer.
          </h1>
          <p className="mx-auto max-w-2xl font-sans text-body-lg text-on-surface-variant">
            Whether it&apos;s an emergency leak or a routine question, reach
            us directly — no call centers, just the team that does the work.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <ContactDetails />
          <ServiceZoneMap />
        </div>
      </div>
    </section>
  );
}
