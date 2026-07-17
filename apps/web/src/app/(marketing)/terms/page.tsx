import { LegalDocument } from "@/components/legal/LegalDocument";

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      updated="January 1, 2026"
      intro="These terms govern bookings, inspections, and repair work carried out by AIAS Engineering Solutions. By scheduling a service, you agree to the terms below."
      sections={[
        {
          heading: "Bookings & Scheduling",
          body: "Appointment requests submitted through the site or app are confirmed by phone or email within 24 hours. Preferred visit dates are estimates until confirmed by our team.",
        },
        {
          heading: "Warranties",
          body: "Every completed repair carries a written warranty ranging from 5 to 15 years depending on the material and technique used, detailed in your service invoice. Warranty coverage excludes damage from unrelated structural work performed by third parties after our repair.",
        },
        {
          heading: "Payment & Invoicing",
          body: "Quotes provided during inspection are estimates; final invoices reflect the actual scope of work completed and are payable through the methods listed in your account.",
        },
        {
          heading: "Cancellations & Rescheduling",
          body: "Active bookings can be rescheduled from My Bookings up to 24 hours before the scheduled visit at no charge. Later changes may be subject to a technician dispatch fee.",
        },
      ]}
    />
  );
}
