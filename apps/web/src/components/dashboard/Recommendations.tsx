const RECOMMENDATIONS = [
  {
    icon: "solar_power",
    title: "Renewable Audit",
    description: "Save up to 40% on bills with Marina Bay solar incentives.",
  },
  {
    icon: "shield_moon",
    title: "Monsoon Shield",
    description: "Prepare your roof for the upcoming heavy rain season.",
  },
];

export function Recommendations() {
  return (
    <section className="glass flex-grow rounded-3xl p-6">
      <h4 className="mb-6 font-display text-headline-md text-primary">
        Tailored For You
      </h4>
      <div className="space-y-4">
        {RECOMMENDATIONS.map((item) => (
          <button
            key={item.title}
            type="button"
            className="group w-full rounded-2xl border border-white bg-surface-container-low p-4 text-left transition-all hover:border-primary/20"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="material-icon text-primary">
                {item.icon}
              </span>
              <h5 className="font-bold text-primary transition-colors group-hover:text-secondary">
                {item.title}
              </h5>
            </div>
            <p className="font-sans text-label-md text-on-surface-variant">
              {item.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
