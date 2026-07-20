export interface ServiceArea {
  city: string;
  responseTimeLabel: string;
}

export const SERVICE_AREAS: ServiceArea[] = [
  { city: "Bhubaneswar", responseTimeLabel: "Same-day response · HQ city" },
  { city: "Cuttack", responseTimeLabel: "Same-day response" },
  { city: "Puri", responseTimeLabel: "Next-day response" },
  { city: "Rourkela", responseTimeLabel: "Next-day response" },
];

export const SERVICE_AREA_CITIES = SERVICE_AREAS.map((area) => area.city);

export function checkServiceArea(city: string): ServiceArea | null {
  return SERVICE_AREAS.find((area) => area.city === city) ?? null;
}
