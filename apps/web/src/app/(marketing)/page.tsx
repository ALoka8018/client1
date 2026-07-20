import { Hero } from "@/components/home/Hero";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { CoreSolutions } from "@/components/home/CoreSolutions";
import { InspectionProcess } from "@/components/home/InspectionProcess";
import { EmergencyBanner } from "@/components/home/EmergencyBanner";
import { VisibleResults } from "@/components/home/VisibleResults";
import { ServiceAreaCheck } from "@/components/ServiceAreaCheck";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="container-max py-8">
        <ServiceAreaCheck className="mx-auto max-w-2xl" />
      </div>
      <TrustIndicators />
      <CoreSolutions />
      <InspectionProcess />
      <EmergencyBanner />
      <VisibleResults />
    </>
  );
}
