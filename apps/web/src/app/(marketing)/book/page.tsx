import { BookingHero } from "@/components/book/BookingHero";
import { BookingForm } from "@/components/book/BookingForm";
import { ContactDetails } from "@/components/book/ContactDetails";
import { ServiceZoneMap } from "@/components/book/ServiceZoneMap";

export default function BookPage() {
  return (
    <>
      <BookingHero />
      <div className="container-max mb-section-mobile grid grid-cols-1 gap-12 md:mb-section-desktop lg:grid-cols-12">
        <div className="lg:col-span-7">
          <BookingForm />
        </div>
        <div className="space-y-12 lg:col-span-5">
          <ContactDetails />
          <ServiceZoneMap />
        </div>
      </div>
    </>
  );
}
