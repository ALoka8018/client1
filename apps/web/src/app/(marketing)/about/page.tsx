import { OurStory } from "@/components/about/OurStory";
import { ValuesGrid } from "@/components/about/ValuesGrid";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { CtaBanner } from "@/components/services/CtaBanner";

export default function AboutPage() {
  return (
    <>
      <section className="pt-section-mobile md:pt-section-desktop">
        <div className="container-max text-center">
          <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1 font-sans text-label-md uppercase tracking-widest text-primary">
            About AIAS Engineering
          </span>
          <h1 className="mx-auto mb-6 max-w-3xl font-display text-headline-md text-primary md:text-display-lg">
            Engineering Trust Since 2008.
          </h1>
          <p className="mx-auto max-w-2xl font-sans text-body-lg text-on-surface-variant">
            We&apos;re a team of civil engineers and diagnostic specialists
            who believe every leak, crack, and structural issue has a
            root cause worth finding — and a permanent, non-destructive
            fix worth engineering.
          </p>
        </div>
      </section>

      <OurStory />
      <ValuesGrid />
      <TrustIndicators />

      <CtaBanner
        title="Ready to work with engineers, not patch-jobs?"
        description="Schedule a diagnostic survey and see why 5000+ clients trust AIAS with their structural issues."
        primaryLabel="Book a Survey"
        primaryHref="/book"
        secondaryLabel="Explore Services"
        secondaryHref="/services"
      />
    </>
  );
}
