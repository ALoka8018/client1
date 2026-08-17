const INDICATORS = [
  { icon: "history", stat: "10+ Years", label: "Industry Presence" },
  { icon: "check_circle", stat: "5000+ Repairs", label: "Successful Audits" },
  { icon: "engineering", stat: "Expert Engineers", label: "Certified Professionals" },
];

export function TrustIndicators() {
  return (
    <section className="border-y border-outline-variant/30 bg-surface-container-low py-12">
      <div className="container-max flex flex-wrap justify-center gap-8 md:justify-around">
        {INDICATORS.map((item) => (
          <div
            key={item.stat}
            className="flex items-center gap-4 rounded-full bg-surface-container-lowest px-8 py-4"
          >
            <span
              className="material-icon scale-125 text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {item.icon}
            </span>
            <div>
              <div className="font-display text-headline-md text-primary">
                {item.stat}
              </div>
              <div className="font-sans text-label-md uppercase text-on-surface-variant">
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
