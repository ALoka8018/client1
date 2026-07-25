import { ServiceGrid } from "@/components/services/ServiceGrid";
import { AdvancedEquipment } from "@/components/services/AdvancedEquipment";
import { CtaBanner } from "@/components/services/CtaBanner";

export default function ServicesPage() {
  return (
    <>
      <section className="py-section-mobile md:py-section-desktop">
        <div className="container-max">
          <div className="mb-8 max-w-3xl">
            <h1 className="mb-6 font-display text-display-sm text-primary md:text-display-lg">
              Precision Solutions for Every Structural Challenge.
            </h1>
            <p className="mb-12 font-sans text-body-lg text-on-surface-variant">
              Discover our comprehensive directory of engineering and
              diagnostic services. From invisible leaks to complex moisture
              ingress, our advanced technology finds the root cause.
            </p>
          </div>
          <ServiceGrid />
        </div>
      </section>

      <AdvancedEquipment />

      <CtaBanner
        title="Don't guess. Know."
        description="Schedule a diagnostic survey today and receive a comprehensive engineering report with actionable solutions."
        primaryLabel="Book a Survey"
        primaryHref="/book"
        secondaryLabel="Request a Quote"
        secondaryHref="/book"
      />
    </>
  );
}
