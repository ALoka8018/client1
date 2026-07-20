import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";

const PORTAL_NAV_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
];

const PORTAL_BOTTOM_NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/services", label: "Services", icon: "construction" },
  { href: "/bookings", label: "Bookings", icon: "calendar_today" },
  { href: "/account", label: "Profile", icon: "person" },
];

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header
        navLinks={PORTAL_NAV_LINKS}
        logoHref="/dashboard"
        ctaVariant="primary"
      />
      <main className="flex-1 pt-16 pb-24 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav items={PORTAL_BOTTOM_NAV_ITEMS} />
      <WhatsAppWidget />
    </>
  );
}
