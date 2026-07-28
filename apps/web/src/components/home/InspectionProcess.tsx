import { cn } from "@repo/ui/cn";

const STEPS = [
  {
    number: "01",
    title: "Initial Audit",
    description: "Visual and sensory inspection of suspected damp areas.",
  },
  {
    number: "02",
    title: "Tech Scan",
    description:
      "Deployment of thermal and acoustic sensors for precision mapping.",
  },
  {
    number: "03",
    title: "Diagnosis",
    description: "Detailed reporting of source, extent, and repair costs.",
  },
  {
    number: "04",
    title: "Resolution",
    description: "Execution of non-invasive repairs by certified teams.",
    accent: true,
  },
];

export function InspectionProcess() {
  return (
    <section className="bg-surface-container py-section-mobile md:py-section-desktop">
      <div className="container-max">
        <div className="mb-12 text-center md:mb-20">
          <h2 className="font-display text-headline-md text-primary md:text-headline-lg">
            The Seepage Leakage All Solutions Inspection Process
          </h2>
        </div>

        <div className="relative flex flex-col items-start justify-between gap-12 md:flex-row md:gap-4">
          <div className="absolute top-10 left-0 hidden h-0.5 w-full bg-outline-variant md:block" />
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative z-10 flex flex-1 flex-col items-center text-center"
            >
              <div
                className={cn(
                  "mb-6 flex h-20 w-20 items-center justify-center rounded-full border-8 border-surface-container font-display text-headline-md text-white",
                  step.accent ? "bg-secondary" : "bg-primary",
                )}
              >
                {step.number}
              </div>
              <h4 className="mb-2 font-display text-headline-md text-primary">
                {step.title}
              </h4>
              <p className="font-sans text-body-md text-on-surface-variant">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
