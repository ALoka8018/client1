import Image from "next/image";
import { cn } from "@repo/ui/cn";

const STEPS = [
  { key: "requested", label: "Requested", icon: "check", done: true },
  { key: "assigned", label: "Assigned", icon: "engineering", done: true },
  { key: "enroute", label: "En Route", icon: "local_shipping", done: true, current: true },
  { key: "completion", label: "Completion", icon: "home_repair_service", done: false },
];

export function ActiveJobCard() {
  return (
    <section className="glass relative overflow-hidden rounded-3xl p-8">
      <div className="absolute top-0 right-0 p-4">
        <span className="rounded-full bg-secondary-container px-3 py-1 font-sans text-label-md text-on-secondary-container">
          IN PROGRESS
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
            Current Leakage Repair
          </h3>
          <p className="text-on-surface-variant">
            Ticket #SLAS-8902 • Scheduled for today
          </p>
        </div>
      </div>

      <div className="mt-8 mb-10 flex items-start justify-between">
        {STEPS.map((step, index) => (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  step.current
                    ? "border-4 border-primary/20 bg-primary text-white shadow-lg shadow-primary/20"
                    : step.done
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
                  step.done ? "text-primary" : "text-on-surface-variant",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "-mt-6 h-0.5 flex-1",
                  STEPS[index + 1]?.done || step.done
                    ? "bg-primary"
                    : "bg-surface-container-high",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlRY-imQ5mgtm0W1SQqAc317BZRPxbnt9VhiPk_6TFnUREU1g7bwok3Gns8Ljd6eQK8yuOEgKd-dXpGd2R1UJyXOebgRn0YXBQprPyNpse0zPcuh3TgUS1r7OmotE8mvUpNIWhYYJsZXL-YZZv2CvVCLFCkTX9qPwV_AuQdASbwPfJHvtJ3LlDWo94JEOUhdVK1TEb0SRcZ46zgDwoYbIdYR-xRLd_4PYv6AXs7TbbBdzO5YmvZaCpcliQ6lFQlT8_MnYqxoOzJIY"
            alt="Engineer Marcus Chen"
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="font-bold text-primary">Engineer: Marcus Chen</p>
          <p className="font-sans text-label-md text-on-surface-variant">
            Estimated arrival in 15 minutes
          </p>
        </div>
        <a
          href="tel:+916742304500"
          className="ml-auto rounded-full bg-primary p-2 text-on-primary transition-transform hover:scale-105"
        >
          <span className="material-symbols-outlined text-[20px]">call</span>
        </a>
      </div>
    </section>
  );
}
