import Link from "next/link";

const COMPANY_LINKS = [
  { href: "/services", label: "Expertise" },
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
      <h4 className="mb-6 font-sans text-label-md uppercase text-primary">
        {title}
      </h4>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-on-surface-variant underline decoration-transparent transition-colors hover:text-secondary hover:decoration-secondary"
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
    <footer className="w-full bg-surface-container-highest pt-16 pb-32 md:pb-16">
      <div className="container-max flex flex-col">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <h2 className="mb-6 font-brand text-headline-md text-primary">
              Seepage Leakage All Solutions
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
        <div className="border-t border-outline-variant pt-8 text-center md:text-left">
          <p className="font-sans text-body-md text-on-surface-variant">
            © 2024 Seepage Leakage All Solutions. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
