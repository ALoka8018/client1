import Image from "next/image";

const CHECKLIST = [
  "100% Non-Destructive Methodology",
  "Certified Thermographic Reporting",
  "Guaranteed Repair Success Rate",
];

export function VisibleResults() {
  return (
    <section className="py-section-mobile md:py-section-desktop">
      <div className="container-max grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="mb-6 font-display text-headline-md text-primary md:text-headline-lg">
            Invisible Problems, <br />
            <span className="text-secondary">Visible Results.</span>
          </h2>
          <p className="mb-8 font-sans text-body-lg text-on-surface-variant">
            Our thermal imaging cameras see what the human eye can&apos;t. We
            detect temperature anomalies that indicate moisture pooling
            before it even stains your paint.
          </p>
          <div className="space-y-4">
            {CHECKLIST.map((item) => (
              <div key={item} className="flex items-center gap-4">
                <span className="material-icon text-secondary">
                  check_circle
                </span>
                <span className="font-sans text-body-md font-semibold text-primary">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-2xl shadow-2xl">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-DNRxnjTsQp1AIvglD8AkmdcRQH1LmvsfgNZbqMwQ3zH4AbTYmW1H62o3eFhztJ8aVr46R-g0OuA45G_T63a2g8zpIW3WEnWt3oDk31IaNEsXEGbwPxTOoopLsmtVHY-7nniwAkC0lYk5XEoK6nzzD8ch_ugMVngC_4pvp-ahmAre-4JLF25Qn7RUSH2Jn9qm0-exML61ZUIwF1negrVvXH8nvV3OpyFe5jqGTjOiHyM82VwaScNJG4zigYFisTqBYqu9Pn4-P18"
            alt="Split comparison: a normal wall alongside its thermal imaging view revealing a hidden moisture plume"
            fill
            className="object-cover"
          />
          <div className="absolute inset-y-0 left-1/2 z-20 w-1 bg-secondary-container shadow-[0_0_15px_rgba(254,107,0,0.5)]">
            <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-secondary-container text-white shadow-lg">
              <span className="material-icon">unfold_more</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
