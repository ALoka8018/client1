import { getWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppWidget() {
  const href = getWhatsAppUrl();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-6 bottom-24 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container shadow-lg shadow-secondary/20 transition-transform hover:scale-105 md:bottom-6"
    >
      <span
        className="material-symbols-outlined text-3xl"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        chat
      </span>
    </a>
  );
}
