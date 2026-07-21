"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const SETTINGS_LINKS = [
  { href: "/account/documents", icon: "folder_open", label: "Documents" },
  { href: "/support", icon: "support_agent", label: "Support Center" },
  { href: "/privacy", icon: "security", label: "Privacy & Security" },
  { href: "/admin", icon: "admin_panel_settings", label: "Admin Panel", badge: "Limited" },
];

export function SettingsSidebar() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-gutter">
      <div className="group relative overflow-hidden rounded-3xl bg-primary p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h3 className="mb-2 font-display text-headline-md">Join the Fleet</h3>
          <p className="mb-6 text-on-primary-container">
            Expert in structural repair? Become a certified Seepage Leakage All Solutions technician
            today.
          </p>
          <Link
            href="/become-a-technician"
            className="block w-full rounded-full bg-secondary-container py-3 text-center font-sans text-label-md text-on-secondary-container transition-all hover:opacity-90 active:scale-95"
          >
            Become a Technician
          </Link>
        </div>
        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 transition-transform duration-500 group-hover:rotate-12">
          construction
        </span>
      </div>

      <nav className="glass flex flex-col gap-1 rounded-3xl p-4">
        {SETTINGS_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="group flex items-center gap-4 rounded-2xl p-4 text-on-surface-variant transition-all hover:bg-primary/5 hover:text-primary"
          >
            <span className="material-symbols-outlined text-primary">
              {link.icon}
            </span>
            <span className="grow font-sans text-label-md">{link.label}</span>
            {link.badge ? (
              <span className="rounded bg-error-container px-2 py-0.5 text-[10px] font-bold tracking-tighter text-on-error-container uppercase">
                {link.badge}
              </span>
            ) : (
              <span className="material-symbols-outlined opacity-0 transition-opacity group-hover:opacity-100">
                chevron_right
              </span>
            )}
          </a>
        ))}
        <div className="my-2 h-px bg-outline-variant/20" />
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-4 rounded-2xl p-4 text-left text-error transition-all hover:bg-error/5"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-sans text-label-md">Sign Out</span>
        </button>
      </nav>

      <div className="flex items-center justify-between rounded-full bg-surface-container-low px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">
            verified_user
          </span>
          <span className="font-sans text-label-md text-primary">
            End-to-End Encrypted
          </span>
        </div>
        <span className="material-symbols-outlined text-sm text-on-surface-variant">
          info
        </span>
      </div>
    </div>
  );
}
