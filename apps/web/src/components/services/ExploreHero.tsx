import { buttonClasses } from "@repo/ui/Button";

export function ExploreHero() {
  return (
    <section className="mb-12">
      <div className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-3xl bg-primary p-8 text-center">
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
        <h1 className="relative z-10 mb-6 font-display text-display-sm text-on-primary drop-shadow-lg md:text-display-lg">
          Engineering Solutions Discovery
        </h1>
        <div className="group relative z-10 w-full max-w-2xl">
          <div className="glass flex items-center gap-2 rounded-full p-2 pl-4 transition-all group-focus-within:ring-2 ring-secondary-container/50 sm:gap-3 sm:pl-6">
            {/* Decorative — drop it below sm so the input and button keep room. */}
            <span className="material-icon hidden text-on-surface-variant sm:inline-block">
              search
            </span>
            <input
              type="text"
              placeholder="Search for waterproofing, plumbing, inspections..."
              className="w-full min-w-0 border-none bg-transparent font-sans text-on-surface placeholder:text-outline focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              className={buttonClasses({ variant: "primary", pill: true })}
            >
              Find
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
