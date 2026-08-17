"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getAuthHeader } from "@/lib/supabase/authHeader";

export type AdminRole = "ADMIN" | "SUPER_ADMIN";

type AdminRoleContextValue = {
  role: AdminRole;
  headers: { Authorization: string };
};

const AdminRoleContext = createContext<AdminRoleContextValue | null>(null);

export function useAdminRole(): AdminRoleContextValue {
  const ctx = useContext(AdminRoleContext);
  if (!ctx) {
    throw new Error("useAdminRole must be used within the /admin layout");
  }
  return ctx;
}

export function Restricted() {
  return (
    <div className="container-max flex flex-col items-center py-section-mobile text-center md:py-section-desktop">
      <span className="material-icon mb-6 text-6xl text-outline">lock</span>
      <h1 className="mb-4 font-display text-headline-md text-primary">
        Admin Panel — Restricted
      </h1>
      <p className="max-w-md font-sans text-body-md text-on-surface-variant">
        This area is limited to Seepage Doctor staff accounts with administrative
        permissions. If you believe you should have access, contact your account manager.
      </p>
    </div>
  );
}

type State =
  | { status: "loading" }
  | { status: "restricted" }
  | { status: "ok"; value: AdminRoleContextValue };

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    (async () => {
      const headers = await getAuthHeader();
      if (!headers) {
        setState({ status: "restricted" });
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/me`, { headers });
      if (res.ok) {
        const me = await res.json();
        if (me.role === "ADMIN" || me.role === "SUPER_ADMIN") {
          setState({ status: "ok", value: { role: me.role, headers } });
          return;
        }
      }
      setState({ status: "restricted" });
    })();
  }, []);

  if (state.status === "loading") {
    return (
      <div className="container-max py-section-mobile text-center md:py-section-desktop">
        <p className="text-on-surface-variant">Checking access…</p>
      </div>
    );
  }

  if (state.status === "restricted") {
    return <Restricted />;
  }

  return (
    <AdminRoleContext.Provider value={state.value}>{children}</AdminRoleContext.Provider>
  );
}
