import { DocumentsList } from "@/components/account/DocumentsList";

export default function DocumentsPage() {
  return (
    <div className="container-max">
      <div className="mb-8">
        <h1 className="font-display text-headline-lg-mobile text-primary md:text-headline-lg">
          Documents
        </h1>
        <p className="mt-2 font-sans text-body-lg text-on-surface-variant">
          Download your invoices and view inspection reports in one place.
        </p>
      </div>
      <DocumentsList />
    </div>
  );
}
