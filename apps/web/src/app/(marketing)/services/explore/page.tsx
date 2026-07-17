import { ExploreHero } from "@/components/services/ExploreHero";
import { Marketplace } from "@/components/services/Marketplace";

export default function ExploreServicesPage() {
  return (
    <div className="container-max py-section-mobile md:py-section-desktop">
      <ExploreHero />
      <Marketplace />
    </div>
  );
}
