import { Hero } from "@/components/home/Hero";
import { TrustIndicators } from "@/components/home/TrustIndicators";
import { CoreSolutions } from "@/components/home/CoreSolutions";
import { InspectionProcess } from "@/components/home/InspectionProcess";
import { EmergencyBanner } from "@/components/home/EmergencyBanner";
import { VisibleResults } from "@/components/home/VisibleResults";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustIndicators />
      <CoreSolutions />
      <InspectionProcess />
      <EmergencyBanner />
      <VisibleResults />
    </>
  );
}
