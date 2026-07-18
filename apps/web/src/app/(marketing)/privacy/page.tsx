import { LegalDocument } from "@/components/legal/LegalDocument";

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      updated="July 18, 2026"
      intro='Seepage Leakage All Solutions ("we", "us", "our") provides waterproofing, plumbing, and structural repair services across Bhubaneswar and surrounding areas in Odisha, India. This Privacy Policy explains what personal information we collect when you use our website and booking platform, why we collect it, and the choices you have. By creating an account or booking a service with us, you agree to the practices described here.'
      sections={[
        {
          heading: "Information We Collect",
          body: "When you create an account, we collect your name, email address, phone number, and an optional profile photo, along with your account role (for example, customer or staff). To deliver services, we collect details about your properties — a label you choose, the address, city, property type, and map coordinates so our technicians can locate the site. When you book a visit, we collect the service type, your contact phone, preferred date and time, a description of the problem, and any photos or files of the affected area you choose to upload. We also keep records of your invoices, maintenance history, support tickets, payment method details (card brand, last four digits, and expiry only), and any testimonials you submit.",
        },
        {
          heading: "How We Use Your Information",
          body: "We use your information to schedule and carry out inspections and repair work, dispatch technicians to the correct address, and keep you updated on the status of your booking. Your contact details are used to send transactional emails such as booking confirmations and status updates, and to reach you by phone if a visit needs coordination. Uploaded site photos help our engineers assess the problem before arriving. We also use your service history to honour warranties, manage maintenance schedules, and respond to support requests.",
        },
        {
          heading: "Legal Basis and Purpose for Processing",
          body: "We process your information because it is necessary to perform the service contract you enter into when you book with us — we cannot inspect, repair, or invoice without it. Some processing is based on our legitimate interest in running our business safely and efficiently, such as keeping records of completed work and warranty periods. Where the law requires your consent — for example, publishing a testimonial with your name — we will ask for it first. We handle personal data in line with applicable Indian law, including the Digital Personal Data Protection Act, 2023.",
        },
        {
          heading: "Third-Party Service Providers and Data Sharing",
          body: "We use a small number of trusted providers to run our platform. Supabase hosts our database and handles secure account sign-in, which means your account and booking data is stored on Supabase's infrastructure. Card payments are handled by a payment processor: your full card number never touches our servers — the processor gives us a secure token, and we keep only the card brand, last four digits, and expiry so you can recognise your saved card. Transactional emails are delivered through a third-party email service. We share with these providers only what they need to do their job, and we do not sell your personal data to anyone.",
        },
        {
          heading: "Data Retention",
          body: "We keep your account and property information for as long as your account is active. Booking records, invoices, and maintenance history are retained for the duration of any applicable warranty on the work (up to 15 years) and as long as required by Indian tax and accounting law. Uploaded site photos are kept with the related booking record. If you delete your account, we remove or anonymise your personal data except where we must keep it for legal, tax, or warranty purposes.",
        },
        {
          heading: "Data Security",
          body: "We take reasonable technical and organisational measures to protect your information, including encrypted connections (HTTPS) across the site, authenticated access to your account, and role-based access so staff only see what they need. Card details are tokenized by our payment processor rather than stored by us, which significantly reduces payment risk. No system is completely immune to threats, but if we become aware of a breach affecting your data we will notify you and the relevant authorities as required by law.",
        },
        {
          heading: "Your Rights and Choices",
          body: "You can view and update your name, phone number, profile photo, properties, and saved payment methods at any time from your account. You may request a copy of the personal data we hold about you, ask us to correct inaccurate information, or request deletion of your account and data by contacting us at solutions@aiasengineering.com. We will respond within a reasonable time and explain if any data must be retained for legal or warranty reasons. You cannot opt out of essential transactional emails (like booking confirmations) while you have active bookings, as these are part of delivering the service.",
        },
        {
          heading: "Cookies and Tracking",
          body: "We use session cookies to keep you signed in securely — without them, the booking platform cannot work. We may also use basic site analytics to understand which pages are visited and improve the website. We do not use advertising cookies, and we do not track you across other websites. You can clear or block cookies in your browser settings, but blocking session cookies will prevent you from signing in.",
        },
        {
          heading: "Children's Privacy",
          body: "Our services are intended for property owners and tenants who are 18 years or older. We do not knowingly collect personal information from children. If you believe a child has created an account or provided us information, please contact us and we will delete it promptly.",
        },
        {
          heading: "International Data Transfers",
          body: "We are based in Bhubaneswar, Odisha, India, and most of our operations happen here. However, some of our service providers — including Supabase, which hosts our database and authentication — may store or process data on servers located outside India. Where data is transferred abroad, it remains protected by our providers' security commitments and applicable data protection law.",
        },
        {
          heading: "Changes to This Policy",
          body: "We may update this Privacy Policy from time to time as our services or the law change. When we make material changes, we will update the effective date at the top of this page and, where appropriate, notify you by email or a notice on the site. Continuing to use our services after an update means you accept the revised policy.",
        },
        {
          heading: "Contact Us",
          body: "If you have any questions about this Privacy Policy or how we handle your data, please reach out. Email us at solutions@aiasengineering.com, call +91 674 230 4500, or write to Seepage Leakage All Solutions, Infocity Road, Patia, Bhubaneswar, Odisha 751024. We aim to respond to all privacy enquiries promptly.",
        },
      ]}
    />
  );
}
