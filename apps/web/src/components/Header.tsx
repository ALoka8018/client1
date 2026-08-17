"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonClasses, type ButtonVariant } from "@repo/ui/Button";
import { cn } from "@repo/ui/cn";
import { NotificationBell } from "@/components/NotificationBell";

const DEFAULT_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About Us" },
];

export interface HeaderProps {
  navLinks?: { href: string; label: string }[];
  logoHref?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaVariant?: ButtonVariant;
  showNotifications?: boolean;
}

export function Header({
  navLinks = DEFAULT_NAV_LINKS,
  logoHref = "/",
  ctaLabel = "Book Now",
  ctaHref = "/book",
  ctaVariant = "accent",
  showNotifications = false,
}: HeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="glass fixed top-0 z-50 w-full">
      <div className="container-max flex h-16 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1 lg:gap-4">
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center text-primary lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="material-icon">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
          <Link
            href={logoHref}
            className="font-brand text-brand-sm text-primary lg:text-headline-md"
          >
            Seepage Doctor
          </Link>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-sans text-label-md",
                  active
                    ? "font-bold text-primary"
                    : "text-on-surface-variant hover:opacity-80 transition-opacity",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {showNotifications && <NotificationBell />}
          <Link
            href={ctaHref}
            className={buttonClasses({ variant: ctaVariant, size: "sm", pill: true })}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-outline-variant bg-surface-container-lowest px-margin-mobile py-4 lg:hidden">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded px-3 py-2 font-sans text-body-md",
                  active
                    ? "font-bold text-primary bg-surface-container"
                    : "text-on-surface-variant",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
