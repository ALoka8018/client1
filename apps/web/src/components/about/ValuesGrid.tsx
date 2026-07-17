const VALUES = [
  {
    icon: "verified",
    title: "Precision First",
    description:
      "Every diagnosis is backed by instrumentation, not guesswork — acoustic, thermal, and moisture data before a single recommendation is made.",
  },
  {
    icon: "handshake",
    title: "No-Breakage Philosophy",
    description:
      "We fix root causes with nano-injection and non-destructive methods, preserving the structural integrity and finish you already paid for.",
  },
  {
    icon: "workspace_premium",
    title: "Engineering-Grade Materials",
    description:
      "Every membrane, sensor, and repair compound meets industrial specification — never a local cement patch dressed up as a fix.",
  },
  {
    icon: "diversity_3",
    title: "Certified Teams",
    description:
      "Field engineers are trained, badged, and insured, with senior structural engineers signing off on every technical report.",
  },
];

export function ValuesGrid() {
  return (
    <section className="py-section-mobile md:py-section-desktop">
      <div className="container-max">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-display text-headline-md text-primary md:text-headline-lg">
            What We Stand On
          </h2>
          <p className="mx-auto max-w-2xl font-sans text-body-lg text-on-surface-variant">
            Four principles that shape every inspection, report, and repair
            we deliver.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl bg-surface-container-lowest p-8 shadow-level-1"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container">
                <span className="material-symbols-outlined text-3xl text-on-primary-container">
                  {value.icon}
                </span>
              </div>
              <h3 className="mb-3 font-display text-headline-md text-primary">
                {value.title}
              </h3>
              <p className="font-sans text-body-md text-on-surface-variant">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
