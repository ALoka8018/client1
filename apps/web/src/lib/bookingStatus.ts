export type BookingStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "ASSIGNED"
  | "EN_ROUTE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export const RESCHEDULABLE_STATUSES: BookingStatus[] = ["REQUESTED", "CONFIRMED", "ASSIGNED"];
export const CANCELLABLE_STATUSES: BookingStatus[] = [
  "REQUESTED",
  "CONFIRMED",
  "ASSIGNED",
  "EN_ROUTE",
];

export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; badgeClass: string; barClass: string }
> = {
  REQUESTED: {
    label: "Requested",
    badgeClass: "bg-surface-container text-on-surface-variant",
    barClass: "bg-outline",
  },
  CONFIRMED: {
    label: "Confirmed",
    badgeClass: "bg-primary-container/10 text-on-primary-fixed-variant",
    barClass: "bg-primary",
  },
  ASSIGNED: {
    label: "Assigned",
    badgeClass: "bg-primary-container/10 text-on-primary-fixed-variant",
    barClass: "bg-primary",
  },
  EN_ROUTE: {
    label: "En Route",
    badgeClass: "bg-secondary-container/10 text-on-secondary-container",
    barClass: "bg-secondary",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badgeClass: "bg-secondary-container/10 text-on-secondary-container",
    barClass: "bg-secondary",
  },
  COMPLETED: { label: "Completed", badgeClass: "bg-green-100 text-green-700", barClass: "bg-green-500" },
  CANCELLED: { label: "Cancelled", badgeClass: "bg-gray-100 text-gray-500", barClass: "bg-gray-400" },
};

/** Index into the 4-stage progress tracker (requested / assigned / en route / completion). */
export const BOOKING_PROGRESS_STEP: Record<BookingStatus, number> = {
  REQUESTED: 0,
  CONFIRMED: 1,
  ASSIGNED: 1,
  EN_ROUTE: 2,
  IN_PROGRESS: 3,
  COMPLETED: 3,
  CANCELLED: -1,
};
