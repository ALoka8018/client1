"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Property = {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  propertyType: string;
  isPrimary: boolean;
};

const PROPERTY_TYPE_ICONS: Record<string, string> = {
  RESIDENTIAL: "home",
  COMMERCIAL: "business",
  INDUSTRIAL: "factory",
  INFRASTRUCTURE: "foundation",
};

export function SavedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) {
            setError("Your session expired. Please sign in again.");
            setLoading(false);
          }
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/properties`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
          if (!cancelled) setError("Could not load your properties. Please try again.");
          return;
        }

        const data = (await res.json()) as Property[];
        if (!cancelled) setProperties(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError("Could not reach the server. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="glass h-full rounded-3xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h3 className="font-display text-headline-md text-primary-container">
          Saved Properties
        </h3>
        <button
          type="button"
          disabled
          title="Properties are added automatically when you book a service"
          className="flex items-center gap-1 font-sans text-label-md text-outline"
        >
          Add New
          <span className="material-icon text-sm">add</span>
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center font-sans text-body-md text-on-surface-variant">
          Loading properties…
        </p>
      ) : error ? (
        <p className="py-8 text-center font-sans text-body-md text-error">{error}</p>
      ) : properties.length === 0 ? (
        <p className="py-8 text-center font-sans text-body-md text-on-surface-variant">
          No properties yet — a property is added automatically the first time you book a
          service.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {properties.map((property) => (
            <div
              key={property.id}
              className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 transition-all duration-300 hover:shadow-xl"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-xl bg-primary/5 p-3 text-primary">
                  <span
                    className="material-icon"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {PROPERTY_TYPE_ICONS[property.propertyType] ?? "home"}
                  </span>
                </div>
                {property.isPrimary && (
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-[12px] font-bold tracking-wider text-secondary">
                    PRIMARY
                  </span>
                )}
              </div>
              <h4 className="mb-1 font-display text-[18px] text-primary">
                {property.label}
              </h4>
              <p className="mb-6 leading-tight text-body-md text-on-surface-variant">
                {property.addressLine}, {property.city}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
