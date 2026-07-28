"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/cn";
import { getWhatsAppUrl } from "@/lib/whatsapp";

const DEFAULT_NAV_ITEMS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/services", label: "Services", icon: "construction" },
  { href: "/book", label: "Quote", icon: "calendar_today" },
  { href: getWhatsAppUrl(), label: "WhatsApp", icon: "chat" },
];

export interface MobileBottomNavProps {
  items?: { href: string; label: string; icon: string }[];
}

export function MobileBottomNav({ items = DEFAULT_NAV_ITEMS }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="glass fixed bottom-0 left-0 z-50 flex w-full items-stretch rounded-t-3xl px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-1.5",
              active ? "text-secondary" : "text-on-surface-variant",
            )}
          >
            <span
              className={cn(
                "material-icon flex h-7 w-12 items-center justify-center rounded-full text-2xl",
                active && "bg-secondary-container/25",
              )}
            >
              {item.icon}
            </span>
            <span className="w-full truncate text-center font-sans text-label-sm">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
