import { LegalDocument } from "@/components/legal/LegalDocument";

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      updated="January 1, 2026"
      intro="Seepage Leakage All Solutions collects only the information needed to schedule inspections, deliver engineering reports, and support your account. This page explains what we collect, how we use it, and the choices you have."
      sections={[
        {
          heading: "Information We Collect",
          body: "When you book an inspection or create an account, we collect your name, phone number, email, property address, and any site images or problem descriptions you choose to submit. Our systems also log booking history and invoice records for your account.",
        },
        {
          heading: "How We Use It",
          body: "Your information is used to schedule technicians, generate diagnostic and structural reports, process payments, and communicate appointment updates. We do not sell your personal data to third parties.",
        },
        {
          heading: "Data Retention",
          body: "Property and service records are retained for the duration of any active warranty on your project, plus applicable statutory record-keeping periods, after which they are securely deleted on request.",
        },
        {
          heading: "Your Choices",
          body: "You can review, correct, or request deletion of your account data at any time from Account Settings, or by contacting our Support Center.",
        },
      ]}
    />
  );
}
