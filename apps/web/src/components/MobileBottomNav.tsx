"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/cn";

const DEFAULT_NAV_ITEMS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/services", label: "Services", icon: "construction" },
  { href: "/book", label: "Quote", icon: "calendar_today" },
  { href: "/contact", label: "WhatsApp", icon: "chat" },
];

export interface MobileBottomNavProps {
  items?: { href: string; label: string; icon: string }[];
}

export function MobileBottomNav({ items = DEFAULT_NAV_ITEMS }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="glass fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-3xl px-4 py-3 md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-full px-4 py-1 text-on-surface-variant",
              active && "bg-secondary-container text-on-secondary-container",
            )}
          >
            <span className="material-symbols-outlined text-2xl">
              {item.icon}
            </span>
            <span className="font-sans text-label-md">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
