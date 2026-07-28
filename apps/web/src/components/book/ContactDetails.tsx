import { getWhatsAppUrl } from "@/lib/whatsapp";

const CONTACTS = [
  {
    icon: "call",
    label: "Call Expert",
    value: "+91 674 230 4500",
    href: "tel:+916742304500",
    accent: "primary" as const,
    valueClassName: "font-display text-headline-md text-on-surface",
  },
  {
    icon: "chat",
    label: "WhatsApp Support",
    value: "+91 94370 00000",
    href: getWhatsAppUrl(),
    accent: "secondary" as const,
    valueClassName: "font-display text-headline-md text-on-surface",
  },
  {
    icon: "alternate_email",
    label: "Email Us",
    value: "solutions@aiasengineering.com",
    href: "mailto:solutions@aiasengineering.com",
    accent: "primary" as const,
    valueClassName: "font-sans text-body-lg text-on-surface",
  },
  {
    icon: "location_on",
    label: "Headquarters",
    value: "Infocity Road, Patia, Bhubaneswar, Odisha 751024",
    href: undefined,
    accent: "primary" as const,
    valueClassName: "font-sans text-body-md text-on-surface",
  },
];

export function ContactDetails() {
  return (
    <div className="space-y-8">
      <h3 className="font-display text-headline-md text-primary-container">
        Direct Contact
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {CONTACTS.map((contact) => {
          const content = (
            <>
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-lowest shadow-sm ${
                  contact.accent === "secondary" ? "text-secondary" : "text-primary"
                }`}
              >
                <span className="material-icon">{contact.icon}</span>
              </div>
              <div>
                <p className="font-sans text-label-md uppercase tracking-widest text-outline">
                  {contact.label}
                </p>
                <p className={contact.valueClassName}>{contact.value}</p>
              </div>
            </>
          );

          const className =
            "group flex items-center gap-6 rounded-3xl border border-transparent bg-surface-container p-6 transition-all hover:border-primary/20 hover:bg-surface-container-high";

          return contact.href ? (
            <a key={contact.label} href={contact.href} className={className}>
              {content}
            </a>
          ) : (
            <div key={contact.label} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
