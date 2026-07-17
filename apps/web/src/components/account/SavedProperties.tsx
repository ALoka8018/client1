const PROPERTIES = [
  {
    icon: "home",
    title: "Sterling Residence",
    address: "4522 Oakwood Drive, Silicon Valley, CA",
    primary: true,
  },
  {
    icon: "business",
    title: "AIAS HQ Office",
    address: "700 Innovation Way, Suite 400, CA",
    primary: false,
  },
];

export function SavedProperties() {
  return (
    <div className="glass h-full rounded-3xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="font-display text-headline-md text-primary">
          Saved Properties
        </h3>
        <button
          type="button"
          className="flex items-center gap-1 font-sans text-label-md text-primary hover:underline"
        >
          Add New
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {PROPERTIES.map((property) => (
          <div
            key={property.title}
            className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 transition-all duration-300 hover:shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-xl bg-primary/5 p-3 text-primary">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {property.icon}
                </span>
              </div>
              {property.primary && (
                <span className="rounded-full bg-secondary/10 px-3 py-1 text-[12px] font-bold tracking-wider text-secondary">
                  PRIMARY
                </span>
              )}
            </div>
            <h4 className="mb-1 font-display text-[18px] text-primary">
              {property.title}
            </h4>
            <p className="mb-6 leading-tight text-body-md text-on-surface-variant">
              {property.address}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="grow rounded-lg bg-surface-container py-2 font-sans text-label-md text-primary transition-colors hover:bg-primary hover:text-white"
              >
                Details
              </button>
              <button
                type="button"
                aria-label="More options"
                className="rounded-lg border border-outline-variant p-2 text-on-surface-variant hover:border-primary"
              >
                <span className="material-symbols-outlined text-sm">
                  more_vert
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
