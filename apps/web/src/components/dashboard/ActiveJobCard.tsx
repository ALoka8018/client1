import { cn } from "@repo/ui/cn";
import {
  type BookingStatus,
  BOOKING_STATUS_META,
  BOOKING_PROGRESS_STEP,
} from "@/lib/bookingStatus";

export type ActiveJobBooking = {
  id: string;
  code: string;
  status: BookingStatus;
  scheduledAt: string;
  service: { title: string } | null;
  statusEvents: { status: BookingStatus; note: string | null; createdAt: string }[];
};

const STEPS = [
  { key: "requested", label: "Requested", icon: "check" },
  { key: "assigned", label: "Assigned", icon: "engineering" },
  { key: "enroute", label: "En Route", icon: "local_shipping" },
  { key: "completion", label: "Completion", icon: "home_repair_service" },
];

function formatStepTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const isToday = date.toDateString() === new Date().toDateString();
  const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  return isToday ? time : date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

/** Earliest event that reached this step index — i.e. "when we entered this stage". */
function timeForStep(
  events: ActiveJobBooking["statusEvents"],
  stepIndex: number,
): string | null {
  const match = events.find((e) => BOOKING_PROGRESS_STEP[e.status] === stepIndex);
  return match ? formatStepTime(match.createdAt) : null;
}

function formatScheduled(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const isToday = date.toDateString() === new Date().toDateString();
  const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  return isToday
    ? `Scheduled for today, ${time}`
    : `Scheduled for ${date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}, ${time}`;
}

export function ActiveJobCard({ booking }: { booking?: ActiveJobBooking }) {
  if (!booking) {
    return (
      <section className="glass flex flex-col items-center justify-center gap-3 rounded-3xl p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">
          task_alt
        </span>
        <h3 className="font-display text-headline-md text-primary">No active jobs</h3>
        <p className="max-w-sm text-on-surface-variant">
          You don&apos;t have any bookings in progress right now. Schedule a service to get
          started.
        </p>
      </section>
    );
  }

  const meta = BOOKING_STATUS_META[booking.status];
  const currentStep = BOOKING_PROGRESS_STEP[booking.status];

  return (
    <section className="glass relative overflow-hidden rounded-3xl p-8">
      <div className="absolute top-0 right-0 p-4">
        <span
          className={cn(
            "rounded-full px-3 py-1 font-sans text-label-md",
            meta.badgeClass,
          )}
        >
          {meta.label.toUpperCase()}
        </span>
      </div>

      <div className="mb-8 flex items-start gap-4">
        <div className="rounded-2xl bg-primary-container/10 p-3">
          <span className="material-symbols-outlined text-3xl text-primary">
            water_damage
          </span>
        </div>
        <div>
          <h3 className="font-display text-headline-md text-primary">
            {booking.service?.title ?? "Service Request"}
          </h3>
          <p className="text-on-surface-variant">
            {booking.code} • {formatScheduled(booking.scheduledAt)}
          </p>
        </div>
      </div>

      <div className="mt-8 mb-2 flex items-start justify-between">
        {STEPS.map((step, index) => {
          const done = index <= currentStep;
          const current = index === currentStep;
          const timestamp = done ? timeForStep(booking.statusEvents, index) : null;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    current
                      ? "border-4 border-primary/20 bg-primary text-white shadow-lg shadow-primary/20"
                      : done
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-surface-container-high text-outline",
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {step.icon}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-center font-sans text-label-md",
                    done ? "text-primary" : "text-on-surface-variant",
                  )}
                >
                  {step.label}
                </span>
                {timestamp && (
                  <span className="text-center text-xs text-on-surface-variant">
                    {timestamp}
                  </span>
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "-mt-6 h-0.5 flex-1",
                    index < currentStep ? "bg-primary" : "bg-surface-container-high",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
