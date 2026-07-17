import Link from "next/link";
import { buttonClasses } from "@repo/ui/Button";

const ROLES = [
  {
    title: "Senior Structural Engineer",
    location: "Bhubaneswar, Odisha",
    type: "Full-time",
    description:
      "Lead structural integrity audits and sign off on engineering reports for commercial and industrial clients.",
  },
  {
    title: "Field Diagnostic Technician",
    location: "Cuttack, Odisha",
    type: "Full-time",
    description:
      "Operate thermal imaging and acoustic leak-detection equipment on residential and commercial sites.",
  },
  {
    title: "Waterproofing Applicator",
    location: "Puri, Odisha",
    type: "Contract",
    description:
      "Apply polyurethane and epoxy membrane systems to rooftops and terraces under senior supervision.",
  },
];

export default function CareersPage() {
  return (
    <>
      <section className="pt-section-mobile md:pt-section-desktop">
        <div className="container-max text-center">
          <h1 className="mx-auto mb-6 max-w-2xl font-display text-headline-md text-primary md:text-display-lg">
            Build Your Career in Structural Engineering.
          </h1>
          <p className="mx-auto max-w-2xl font-sans text-body-lg text-on-surface-variant">
            Join a team that treats every leak as an engineering problem,
            not a patch job. We invest in certification, equipment, and
            career growth for field and office staff alike.
          </p>
        </div>
      </section>

      <section className="py-section-mobile md:py-section-desktop">
        <div className="container-max max-w-3xl space-y-6">
          {ROLES.map((role) => (
            <div
              key={role.title}
              className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-8 shadow-level-1 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="mb-1 font-display text-headline-md text-primary">
                  {role.title}
                </h3>
                <p className="mb-3 font-sans text-label-md text-on-surface-variant">
                  {role.location} • {role.type}
                </p>
                <p className="max-w-lg font-sans text-body-md text-on-surface-variant">
                  {role.description}
                </p>
              </div>
              <Link
                href="/contact"
                className={buttonClasses({ variant: "outline", pill: true })}
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
