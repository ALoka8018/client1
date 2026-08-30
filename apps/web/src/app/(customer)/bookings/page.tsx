import { BookingsTabs } from "@/components/bookings/BookingsTabs";

export default function BookingsPage() {
  return (
    <div className="container-max">
      <div className="mb-8">
        <h1 className="mb-2 font-display text-headline-lg-mobile text-primary md:text-headline-lg">
          My History
        </h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Manage your active maintenance, project history, and engineering
          invoices.
        </p>
      </div>
      <BookingsTabs />
    </div>
  );
}
