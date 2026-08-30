import { PortalShell } from "@/components/shared/PortalShell";

export default function TechnicianGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PortalShell>{children}</PortalShell>;
}
