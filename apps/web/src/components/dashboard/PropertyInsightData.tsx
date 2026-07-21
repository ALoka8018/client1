"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PropertyInsight, type HealthMetric } from "./PropertyInsight";

type Property = {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  isPrimary: boolean;
};

export function PropertyInsightData() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) setLoading(false);
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/properties`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }

        const data = (await res.json()) as Property[];
        const list = Array.isArray(data) ? data : [];
        if (!cancelled) {
          setProperties(list);
          setSelectedId(list[0]?.id ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!selectedId) {
        if (!cancelled) setMetrics([]);
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/properties/${selectedId}/health`,
          { headers: { Authorization: `Bearer ${session.access_token}` } },
        );
        if (!res.ok) {
          if (!cancelled) setMetrics([]);
          return;
        }

        const data = (await res.json()) as HealthMetric[];
        if (!cancelled) setMetrics(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setMetrics([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selectedProperty = properties.find((p) => p.id === selectedId) ?? null;

  if (loading) {
    return (
      <section className="glass flex items-center justify-center rounded-3xl p-6">
        <p className="text-on-surface-variant">Loading property insight…</p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {properties.length > 1 && (
        <select
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-2xl border-none bg-surface-container-low px-4 py-3 font-sans text-label-md text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
        >
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.label} {property.isPrimary ? "(Primary)" : ""}
            </option>
          ))}
        </select>
      )}
      <PropertyInsight
        property={selectedProperty ? { id: selectedProperty.id, label: selectedProperty.label } : null}
        metrics={metrics}
      />
    </div>
  );
}
