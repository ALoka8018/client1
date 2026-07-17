export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDocumentProps {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalDocument({ title, updated, intro, sections }: LegalDocumentProps) {
  return (
    <section className="py-section-mobile md:py-section-desktop">
      <div className="container-max max-w-3xl">
        <h1 className="mb-2 font-display text-headline-md text-primary md:text-headline-lg">
          {title}
        </h1>
        <p className="mb-10 font-sans text-label-md text-on-surface-variant">
          Last updated: {updated}
        </p>
        <p className="mb-12 font-sans text-body-lg text-on-surface-variant">
          {intro}
        </p>
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="mb-3 font-display text-headline-md text-primary">
                {section.heading}
              </h2>
              <p className="font-sans text-body-md text-on-surface-variant">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
