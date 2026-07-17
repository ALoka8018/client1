const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const STATUSES = [
  { label: "Electrical", value: "Optimal", ok: true },
  { label: "Plumbing", value: "Needs Attention", ok: false },
  { label: "HVAC", value: "Optimal", ok: true },
];

export function PropertyInsight({ healthPercent = 85 }: { healthPercent?: number }) {
  const offset = CIRCUMFERENCE * (1 - healthPercent / 100);

  return (
    <section className="glass rounded-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h4 className="font-display text-headline-md text-primary">
          Property Insight
        </h4>
        <span className="material-symbols-outlined text-outline">more_vert</span>
      </div>

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
          </svg>
          <span className="absolute text-2xl font-bold text-primary">
            {healthPercent}%
          </span>
        </div>
        <p className="mt-4 text-center font-sans text-body-md text-on-surface-variant">
          Overall Property Health
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {STATUSES.map((status) => (
          <div
            key={status.label}
            className="flex items-center justify-between font-sans text-label-md"
          >
            <span className="text-on-surface-variant">{status.label}</span>
            <span className={status.ok ? "text-primary" : "text-secondary"}>
              {status.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
