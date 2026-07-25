export function ExploreHero() {
  return (
    <section className="mb-12">
      <div className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-3xl bg-primary p-8 text-center">
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
        <h1 className="relative z-10 mb-6 font-display text-display-sm text-on-primary drop-shadow-lg md:text-display-lg">
          Engineering Solutions Discovery
        </h1>
        <div className="group relative z-10 w-full max-w-2xl">
          <div className="glass flex items-center rounded-full px-6 py-4 transition-all group-focus-within:ring-2 ring-secondary-container/50">
            <span className="material-symbols-outlined mr-3 text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Search for waterproofing, plumbing, inspections..."
              className="w-full border-none bg-transparent font-sans text-on-surface placeholder:text-outline focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              className="ml-4 rounded-full bg-primary px-6 py-2 font-sans text-label-md text-on-primary transition-colors hover:bg-primary-container"
            >
              Find
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
