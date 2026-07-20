const WHATSAPP_NUMBER = "919437000000";
const DEFAULT_WHATSAPP_MESSAGE =
  "Hi! I have a leakage/plumbing issue and would like some help.";

export function getWhatsAppUrl(message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
