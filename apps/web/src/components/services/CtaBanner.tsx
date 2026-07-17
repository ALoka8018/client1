import Link from "next/link";
import { buttonClasses } from "@repo/ui/Button";

export interface CtaBannerProps {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

export function CtaBanner({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CtaBannerProps) {
  return (
    <section className="mt-section-mobile md:mt-section-desktop">
      <div className="container-max relative overflow-hidden rounded-[3rem] bg-primary p-12 text-center text-on-primary md:p-24">
        <div className="absolute top-0 right-0 -mt-48 -mr-48 h-96 w-96 rounded-full bg-secondary-container/20 blur-[100px]" />
        <div className="relative z-10">
          <h2 className="mb-6 font-display text-headline-md md:text-headline-lg">
            {title}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl font-sans text-body-lg text-primary-fixed">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={primaryHref}
              className={buttonClasses({ variant: "accent", size: "lg", pill: true })}
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className={buttonClasses({
                variant: "outline-inverse",
                size: "lg",
                pill: true,
              })}
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
