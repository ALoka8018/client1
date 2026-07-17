const STANDARDS = [
  {
    icon: "verified",
    title: "ISO 9001 Certified Process",
    description:
      "Every inspection and repair follows a documented quality-management process, audited annually.",
  },
  {
    icon: "engineering",
    title: "Certified Field Engineers",
    description:
      "All technicians hold structural or mechanical certifications and are re-trained on new equipment yearly.",
  },
  {
    icon: "health_and_safety",
    title: "Site Safety Protocol",
    description:
      "PPE, confined-space, and working-at-height protocols are enforced on every commercial and industrial site.",
  },
  {
    icon: "fact_check",
    title: "Independent Reporting",
    description:
      "Diagnostic reports are signed off by a senior engineer independent of the technician who ran the inspection.",
  },
];

export default function SafetyStandardsPage() {
  return (
    <>
      <section className="pt-section-mobile md:pt-section-desktop">
        <div className="container-max text-center">
          <h1 className="mx-auto mb-6 max-w-2xl font-display text-headline-md text-primary md:text-display-lg">
            Safety Standards &amp; Compliance.
          </h1>
          <p className="mx-auto max-w-2xl font-sans text-body-lg text-on-surface-variant">
            Reliability isn&apos;t just about the fix — it&apos;s about how
            safely and rigorously we get there. Here&apos;s how we hold
            ourselves accountable.
          </p>
        </div>
      </section>

      <section className="py-section-mobile md:py-section-desktop">
        <div className="container-max grid grid-cols-1 gap-gutter sm:grid-cols-2">
          {STANDARDS.map((standard) => (
            <div
              key={standard.title}
              className="flex gap-6 rounded-2xl bg-surface-container-lowest p-8 shadow-level-1"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-container">
                <span className="material-symbols-outlined text-3xl text-on-primary-container">
                  {standard.icon}
                </span>
              </div>
              <div>
                <h3 className="mb-2 font-display text-headline-md text-primary">
                  {standard.title}
                </h3>
                <p className="font-sans text-body-md text-on-surface-variant">
                  {standard.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
