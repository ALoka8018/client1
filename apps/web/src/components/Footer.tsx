import Link from "next/link";

const COMPANY_LINKS = [
  { href: "/safety-standards", label: "Safety Standards" },
  { href: "/careers", label: "Careers" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-3 font-sans text-label-md uppercase text-primary md:mb-6">
        {title}
      </h4>
      <ul className="space-y-1 md:space-y-4">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="-mx-2 inline-block rounded px-2 py-2 text-on-surface-variant underline decoration-transparent transition-colors hover:text-secondary hover:decoration-secondary md:mx-0 md:px-0 md:py-0"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-highest pt-12 pb-32 md:pt-16 lg:pb-16">
      <div className="container-max flex flex-col">
        {/* Link groups sit side by side on mobile — stacked they made the footer
            taller than the viewport for five links. */}
        <div className="mb-10 grid grid-cols-2 gap-x-6 gap-y-10 md:mb-16 md:grid-cols-4 md:gap-12">
          <div className="col-span-2">
            <h2 className="mb-4 font-brand text-headline-md text-primary md:mb-6">
              Seepage Doctor
            </h2>
            <p className="max-w-sm font-sans text-body-md text-on-surface-variant">
              Leading structural diagnostics and engineering solutions across
              the region. We specialize in non-destructive testing and
              root-cause analysis.
            </p>
          </div>
          <FooterLinkList title="Company" links={COMPANY_LINKS} />
          <FooterLinkList title="Legal" links={LEGAL_LINKS} />
        </div>
        <div className="border-t border-outline-variant pt-6 text-center md:pt-8 md:text-left">
          <p className="font-sans text-body-md text-on-surface-variant">
            © 2024 Seepage Doctor. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
