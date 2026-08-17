import { LegalDocument } from "@/components/legal/LegalDocument";

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      updated="July 18, 2026"
      intro="These Terms of Service govern your use of the Seepage Doctor website, booking platform, and the waterproofing, plumbing, and structural repair services we provide. By creating an account, making a booking, or using our site, you agree to these terms. If you do not agree, please do not use our services."
      sections={[
        {
          heading: "Services Description",
          body: "We provide professional waterproofing, leakage detection and repair, plumbing, and structural repair engineering services for residential and commercial properties in and around Bhubaneswar, Odisha. Services typically begin with a site inspection, followed by a written quote and, on your approval, the repair work itself. The exact scope, materials, and techniques are determined by our engineers based on the conditions found at your property.",
        },
        {
          heading: "Bookings and Scheduling",
          body: "You can book an inspection or service visit through your account by selecting a property, service type, and preferred date and time, and describing the problem — photos of the affected area are welcome and help our team prepare. Bookings are requests until confirmed by us; you will receive a confirmation email once your visit is scheduled, and further emails as the status of your booking changes. Scheduled times are our best commitment, but visit windows may occasionally shift due to weather, prior job overruns, or emergencies — we will notify you as early as possible if this happens.",
        },
        {
          heading: "Quotes and Pricing",
          body: "Quotes provided at or after inspection are good-faith estimates based on the visible condition of your property. Seepage and structural issues can reveal additional damage once work begins, so the final invoice reflects the actual scope of work completed, including any changes you approve along the way. We will always discuss significant scope changes and their cost with you before proceeding. Quoted prices are valid for 30 days unless stated otherwise.",
        },
        {
          heading: "Payment & Invoicing",
          body: "Invoices are issued through your account and are payable on completion of work unless we agree otherwise in writing. Card payments are processed by a third-party payment provider; if you save a card, it is stored as a secure token with the processor — we never see or store your full card number, only the card brand, last four digits, and expiry for your reference. Applicable taxes (including GST) are shown on your invoice. Overdue invoices may delay future bookings or warranty service until settled.",
        },
        {
          heading: "Warranties",
          body: "We stand behind our repair work with warranties ranging from 5 to 15 years, depending on the materials and technique used — the exact warranty period for your job is stated on your quote and invoice. The warranty covers failure of the treated area due to defects in our workmanship or the applied materials. It does not cover damage caused by new structural movement, unrelated leaks, third-party alterations to the treated area, or failure to follow any care instructions we provide. To make a warranty claim, contact us with your invoice details and we will inspect and remedy covered issues at no charge.",
        },
        {
          heading: "Cancellations & Rescheduling",
          body: "You may cancel or reschedule a booked visit free of charge up to 24 hours before the scheduled time, directly from your account or by calling us. Cancellations or changes made within 24 hours of the visit incur a dispatch fee, since our technicians and materials will already have been committed to your job. If our team arrives and cannot access the property, the visit is treated as a late cancellation. We will always confirm any fee with you before charging it.",
        },
        {
          heading: "Customer Responsibilities",
          body: "You agree to provide accurate information when booking — including the correct property address, a reachable phone number, and an honest description of the problem. Please ensure our technicians have safe access to the affected areas at the scheduled time, including any locked terraces, basements, or utility spaces, and let us know in advance about pets, parking restrictions, or society entry requirements. You are responsible for informing us of known hazards at the site, such as exposed wiring or unstable structures. Delays or repeat visits caused by inaccessible sites or inaccurate information may incur additional charges.",
        },
        {
          heading: "Limitation of Liability",
          body: "We carry out all work with professional skill and care, and our liability for defective workmanship is covered by the warranty above. To the maximum extent permitted by law, we are not liable for indirect or consequential losses such as loss of rental income or business interruption, or for pre-existing damage and defects not caused by our work. Nothing in these terms limits liability that cannot be limited under Indian law, including liability for death or personal injury caused by negligence. Our total liability for any claim is limited to the amount you paid for the specific job giving rise to the claim, except where the law provides otherwise.",
        },
        {
          heading: "Dispute Resolution & Governing Law",
          body: "These terms are governed by the laws of India. If you have a complaint, please contact us first — most issues are resolved quickly through a site revisit or a conversation with our team. If we cannot resolve a dispute informally, it will be subject to the exclusive jurisdiction of the courts at Bhubaneswar, Odisha. Nothing in this section limits any rights you have under the Consumer Protection Act, 2019.",
        },
        {
          heading: "Account Termination",
          body: "You may close your account at any time by contacting us; any active bookings or unpaid invoices must be settled first. We may suspend or terminate accounts that provide false information, abuse our staff or platform, or repeatedly fail to honour bookings or payments. Termination of your account does not cancel warranties on work already completed and paid for — those remain valid for their full term.",
        },
        {
          heading: "Changes to Terms",
          body: "We may update these Terms of Service from time to time to reflect changes in our services, pricing practices, or the law. When we make material changes, we will update the effective date on this page and, where appropriate, notify you by email. Your continued use of our services after changes take effect means you accept the updated terms; bookings already confirmed are governed by the terms in effect when you booked.",
        },
        {
          heading: "Contact Us",
          body: "For questions about these terms, your booking, or a warranty claim, email us at solutions@aiasengineering.com or call +91 674 230 4500 during business hours. You can also visit or write to us at Seepage Doctor, Infocity Road, Patia, Bhubaneswar, Odisha 751024.",
        },
      ]}
    />
  );
}
