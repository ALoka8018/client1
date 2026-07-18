import Image from "next/image";

export function OurStory() {
  return (
    <section className="py-section-mobile md:py-section-desktop">
      <div className="container-max grid items-center gap-16 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-level-2">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLNHeIvNlcofyiisADUyexVdBBItuF51mItN4Sq-jWyKrUbvvUCBcsRa4MAPL4rFUYwTmPwsQncbvnmmIvfWcRoS7crsXXnK3BGObx8B6dgo3A8xNTnGNnAF1KGHaf0wpZcLwB28QQY3U27-9pY6fzBwUf1T37mQBMCco3zCMvIPeBbG2u3YV20aDShcbbdfZ-ANvoDFfO_U5rlL6OoJ3QSZdkimqRhFhsdDEc0R5VvVY1KOzAiLSZXa0-WHQXE7bPtlTuELL1Fn8"
            alt="Seepage Leakage All Solutions office"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <span className="mb-4 inline-block font-sans text-label-md uppercase tracking-widest text-secondary">
            Our Story
          </span>
          <h2 className="mb-6 font-display text-headline-md text-primary md:text-headline-lg">
            From One Leaking Basement to a Region-Wide Standard.
          </h2>
          <p className="mb-4 font-sans text-body-md text-on-surface-variant">
            Seepage Leakage All Solutions started in 2008 when a single stubborn basement
            leak resisted three separate cement-patch attempts from local
            contractors. Our founders, a civil engineer and a materials
            scientist, diagnosed it with acoustic sensors in an afternoon and
            sealed it permanently without breaking a single tile.
          </p>
          <p className="font-sans text-body-md text-on-surface-variant">
            That diagnostic-first approach became the company. Today our
            engineers carry the same instrumentation — thermal imaging,
            moisture mapping, borescope inspection — into homes, commercial
            towers, and industrial plants across the region, backed by
            written warranties and certified reporting.
          </p>
        </div>
      </div>
    </section>
  );
}
