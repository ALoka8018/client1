import { TechnicianApplicationForm } from "@/components/careers/TechnicianApplicationForm";

export default function BecomeATechnicianPage() {
  return (
    <div className="container-max py-section-mobile md:py-section-desktop">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="mb-4 font-display text-headline-lg-mobile text-primary md:text-headline-lg">
            Become a Technician
          </h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            Expert in structural repair, waterproofing, or plumbing? Join the Seepage Leakage All
            Solutions field team.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/40 bg-surface-container-lowest p-8 shadow-xl shadow-primary/5 md:p-12">
          <TechnicianApplicationForm />
        </div>
      </div>
    </div>
  );
}
