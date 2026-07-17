import { ActiveJobCard } from "@/components/dashboard/ActiveJobCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PropertyInsight } from "@/components/dashboard/PropertyInsight";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { MaintenanceHistory } from "@/components/dashboard/MaintenanceHistory";

export default function DashboardPage() {
  return (
    <div className="container-max">
      <section className="mb-12">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-headline-lg-mobile text-primary md:text-headline-lg">
              Welcome back, Sarah
            </h1>
            <p className="mt-2 font-sans text-body-lg text-on-surface-variant">
              Managing your property at{" "}
              <span className="font-semibold text-on-surface">
                124 Skyline Heights, Marina Bay.
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-surface-container px-4 py-2 font-sans text-label-md text-primary">
            <span className="material-symbols-outlined text-[18px]">
              verified_user
            </span>
            Verified Resident
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="flex flex-col gap-gutter lg:col-span-8">
          <ActiveJobCard />
          <QuickActions />
        </div>
        <aside className="flex flex-col gap-gutter lg:col-span-4">
          <PropertyInsight />
          <Recommendations />
        </aside>
      </div>

      <MaintenanceHistory />
    </div>
  );
}
