const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type HealthSystem = "ELECTRICAL" | "PLUMBING" | "HVAC";
type HealthStatus = "OPTIMAL" | "NEEDS_ATTENTION";

export type HealthMetric = {
  system: HealthSystem;
  status: HealthStatus;
  healthPercent: number;
};

const SYSTEM_LABELS: Record<HealthSystem, string> = {
  ELECTRICAL: "Electrical",
  PLUMBING: "Plumbing",
  HVAC: "HVAC",
};

const SYSTEM_ORDER: HealthSystem[] = ["ELECTRICAL", "PLUMBING", "HVAC"];

interface PropertyInsightProps {
  property: { id: string; label: string } | null;
  metrics: HealthMetric[];
}

export function PropertyInsight({ property, metrics }: PropertyInsightProps) {
  const overall =
    metrics.length > 0
      ? Math.round(metrics.reduce((sum, m) => sum + m.healthPercent, 0) / metrics.length)
      : null;

  const offset = CIRCUMFERENCE * (1 - (overall ?? 0) / 100);
  const metricsBySystem = new Map(metrics.map((m) => [m.system, m]));

  return (
    <section className="glass rounded-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h4 className="font-display text-headline-md text-primary">
          Property Insight
        </h4>
        <span className="material-symbols-outlined text-outline">more_vert</span>
      </div>

      {!property ? (
        <p className="py-8 text-center font-sans text-body-md text-on-surface-variant">
          No properties yet — book a service to add one.
        </p>
      ) : (
        <>
          <div className="flex flex-col items-center py-4">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 128 128">
                <circle
                  className="text-surface-container-high"
                  cx="64"
                  cy="64"
                  r={RADIUS}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="10"
                />
                {overall !== null && (
                  <circle
                    className="text-primary"
                    cx="64"
                    cy="64"
                    r={RADIUS}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <span className="absolute text-2xl font-bold text-primary">
                {overall !== null ? `${overall}%` : "—"}
              </span>
            </div>
            <p className="mt-4 text-center font-sans text-body-md text-on-surface-variant">
              {overall !== null
                ? `Overall Health — ${property.label}`
                : `${property.label} — Not yet assessed`}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {SYSTEM_ORDER.map((system) => {
              const metric = metricsBySystem.get(system);
              return (
                <div
                  key={system}
                  className="flex items-center justify-between font-sans text-label-md"
                >
                  <span className="text-on-surface-variant">{SYSTEM_LABELS[system]}</span>
                  <span
                    className={
                      !metric
                        ? "text-outline"
                        : metric.status === "OPTIMAL"
                          ? "text-primary"
                          : "text-secondary"
                    }
                  >
                    {!metric
                      ? "Not yet assessed"
                      : metric.status === "OPTIMAL"
                        ? "Optimal"
                        : "Needs Attention"}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
