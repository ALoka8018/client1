"use client";

import { useState } from "react";
import { cn } from "@repo/ui/cn";
import { Card } from "@repo/ui/Card";

type Category = "all" | "residential" | "commercial" | "diagnostic";

const FILTERS: { key: Category; label: string }[] = [
  { key: "all", label: "All Services" },
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "diagnostic", label: "Diagnostic & Tech" },
];

const SERVICES: {
  icon: string;
  title: string;
  description: string;
  category: Exclude<Category, "all">;
}[] = [
  {
    icon: "water_drop",
    title: "Water Leakage",
    description:
      "Acoustic and ultrasonic detection for pinpointing hidden water leaks in internal and external plumbing systems.",
    category: "residential",
  },
  {
    icon: "opacity",
    title: "Seepage Control",
    description:
      "Comprehensive analysis of wall and ceiling dampness using high-accuracy non-destructive methods.",
    category: "residential",
  },
  {
    icon: "thermostat",
    title: "Thermal Imaging",
    description:
      "Infrared technology to visualize heat patterns, energy loss, and hidden moisture bridges behind surfaces.",
    category: "diagnostic",
  },
  {
    icon: "sensors",
    title: "Moisture Testing",
    description:
      "Electronic sensor mapping to determine precise moisture content within concrete, masonry, and wood.",
    category: "diagnostic",
  },
  {
    icon: "corporate_fare",
    title: "Industrial Survey",
    description:
      "Full-scale facility structural audits identifying load-bearing issues and large-scale water ingress.",
    category: "commercial",
  },
  {
    icon: "foundation",
    title: "Structural Health",
    description:
      "Comprehensive monitoring of cracks, settlement, and vibration impact on commercial buildings.",
    category: "commercial",
  },
  {
    icon: "house",
    title: "Roof Inspection",
    description:
      "Drone-assisted and physical inspections for terrace leaks, joint failures, and drainage issues.",
    category: "residential",
  },
  {
    icon: "videocam",
    title: "Borescope Inspection",
    description:
      "Visualizing the inside of wall cavities and pipe networks using micro-camera technology.",
    category: "diagnostic",
  },
  {
    icon: "bolt",
    title: "Energy Audit",
    description:
      "Identifying thermal bridges and air leaks that cause soaring energy costs in large complexes.",
    category: "commercial",
  },
  {
    icon: "pool",
    title: "Pool Diagnostics",
    description:
      "Pressure testing and ultrasonic leak detection for swimming pools and water features.",
    category: "residential",
  },
  {
    icon: "speed",
    title: "Flow Testing",
    description:
      "Measuring pipe flow rates and pressure drops to diagnose internal scaling or blockages.",
    category: "diagnostic",
  },
  {
    icon: "sanitizer",
    title: "Mould Analysis",
    description:
      "Surface and air sampling to identify mould types and moisture-driven health risks.",
    category: "residential",
  },
];

export function ServiceGrid() {
  const [filter, setFilter] = useState<Category>("all");
  const visible =
    filter === "all"
      ? SERVICES
      : SERVICES.filter((service) => service.category === filter);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "rounded-full border px-6 py-3 font-sans text-label-md transition-all",
              filter === item.key
                ? "border-transparent bg-primary text-on-primary"
                : "border-outline/30 text-on-surface-variant hover:bg-surface-container",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((service) => (
          <Card
            key={service.title}
            elevation={2}
            className="flex h-full flex-col p-8"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container">
              <span className="material-symbols-outlined text-3xl text-on-primary-container">
                {service.icon}
              </span>
            </div>
            <h3 className="mb-3 font-display text-headline-md text-primary-container">
              {service.title}
            </h3>
            <p className="mb-8 flex-grow font-sans text-body-md text-on-surface-variant">
              {service.description}
            </p>
            <button
              type="button"
              className="flex items-center font-sans text-label-md font-bold text-secondary transition-all hover:gap-2"
            >
              LEARN MORE
              <span className="material-symbols-outlined ml-1">
                chevron_right
              </span>
            </button>
          </Card>
        ))}
      </div>
    </>
  );
}
