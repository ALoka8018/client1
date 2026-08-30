import { ProfileHero } from "@/components/account/ProfileHero";
import { SavedProperties } from "@/components/account/SavedProperties";
import { PaymentMethods } from "@/components/account/PaymentMethods";
import { SettingsSidebar } from "@/components/account/SettingsSidebar";

export default function AccountPage() {
  return (
    <div className="container-max">
      <ProfileHero />
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div className="flex flex-col gap-6 md:col-span-8">
          <SavedProperties />
          <PaymentMethods />
        </div>
        <div className="md:col-span-4">
          <SettingsSidebar />
        </div>
      </div>
    </div>
  );
}
