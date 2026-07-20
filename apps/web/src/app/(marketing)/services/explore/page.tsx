import { ExploreHero } from "@/components/services/ExploreHero";
import { EstimateCalculator } from "@/components/services/EstimateCalculator";
import { Marketplace } from "@/components/services/Marketplace";

export default function ExploreServicesPage() {
  return (
    <div className="container-max py-section-mobile md:py-section-desktop">
      <ExploreHero />
      <EstimateCalculator />
      <Marketplace />
    </div>
  );
}
