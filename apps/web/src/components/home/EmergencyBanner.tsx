export function EmergencyBanner() {
  return (
    <section className="py-16">
      <div className="container-max">
        <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[2rem] bg-secondary-container p-12 shadow-2xl shadow-secondary/30 md:flex-row">
          <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 text-center md:text-left">
            <h2 className="mb-2 font-display text-headline-md text-on-secondary-container md:text-headline-lg">
              Need Immediate Leak Detection?
            </h2>
            <p className="font-sans text-body-lg text-on-secondary-container/80">
              Emergency response teams available 24/7 for critical
              infrastructure leaks.
            </p>
          </div>
          <a
            href="tel:+916742304500"
            className="relative z-10 rounded-2xl bg-on-secondary-container px-10 py-5 font-display text-headline-md text-white shadow-xl transition-transform hover:scale-105"
          >
            Call Emergency Hotline
          </a>
        </div>
      </div>
    </section>
  );
}
