import {
  prisma,
  BookingStatus,
  UserRole,
  type Booking,
  type TechnicianProfile,
  type User,
} from "@repo/database";
import type { UpdateTechnicianJobStatusInput } from "@repo/validation";
import { notify, NotificationType } from "./notifications.js";
import { logger } from "@repo/logger";

const ACTION_TO_STATUS: Record<UpdateTechnicianJobStatusInput["action"], BookingStatus> = {
  en_route: BookingStatus.EN_ROUTE,
  arrived: BookingStatus.IN_PROGRESS,
  completed: BookingStatus.COMPLETED,
};

export async function getOrCreateTechnicianProfile(user: User): Promise<TechnicianProfile> {
  const existing = await prisma.technicianProfile.findUnique({ where: { userId: user.id } });
  if (existing) return existing;

  return prisma.technicianProfile.create({ data: { userId: user.id } });
}

export type TechnicianJob = Booking & {
  service: { title: string } | null;
  property: { addressLine: string; city: string };
  user: { name: string; phone: string | null };
};

export async function listTechnicianJobs(user: User): Promise<TechnicianJob[]> {
  const profile = await getOrCreateTechnicianProfile(user);

  return prisma.booking.findMany({
    where: { technicianId: profile.id },
    include: {
      service: { select: { title: true } },
      property: { select: { addressLine: true, city: true } },
      user: { select: { name: true, phone: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function updateTechnicianJobStatus(
  user: User,
  bookingId: string,
  input: UpdateTechnicianJobStatusInput,
): Promise<Booking> {
  const profile = await getOrCreateTechnicianProfile(user);

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, technicianId: profile.id },
  });

  if (!booking) {
    throw new Error("Job not found");
  }

  const status = ACTION_TO_STATUS[input.action];

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status,
      ...(input.action === "completed" && input.materialsUsed
        ? { materialsUsed: input.materialsUsed }
        : {}),
    },
  });

  await prisma.bookingStatusEvent.create({
    data: { bookingId: booking.id, status, note: input.note },
  });

  try {
    if (status === BookingStatus.COMPLETED) {
      await notify(booking.userId, NotificationType.REVIEW_REQUESTED, {
        title: `Job completed — ${booking.code}`,
        body: "Your service is complete. Let us know how it went!",
        email: {
          subject: `Job Completed — ${booking.code}`,
          html: `
            <p>Your service for booking <strong>${booking.code}</strong> has been marked complete.</p>
            <p>We'd love your feedback — you can leave a review from your bookings page.</p>
            <p>— Seepage Doctor</p>
          `,
          text: `Your booking ${booking.code} is complete. Leave a review from your bookings page.`,
        },
      });
    } else {
      const label = input.action === "en_route" ? "Technician en route" : "Technician arrived";
      await notify(booking.userId, NotificationType.BOOKING_STATUS_CHANGED, {
        title: `${label} — ${booking.code}`,
        body: input.note ?? label,
      });
    }
  } catch (err) {
    logger.error(`Failed to send job status notification for ${booking.code}: ${err}`);
  }

  return updated;
}

export async function isBookingAssignedToTechnician(
  user: User,
  bookingId: string,
): Promise<boolean> {
  const profile = await getOrCreateTechnicianProfile(user);
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, technicianId: profile.id },
  });
  return booking !== null;
}

export interface TechnicianRating {
  average: number;
  count: number;
}

/**
 * Aggregates reviews left on a technician's completed bookings. Falls back
 * to the curated seed TechnicianProfile.rating until they have real reviews
 * — same pattern as Service.averageRating in 1.2, no denormalized counter.
 */
export async function getTechnicianRating(technicianUserId: string): Promise<TechnicianRating> {
  const technicianUser = await prisma.user.findUnique({ where: { id: technicianUserId } });

  if (!technicianUser || technicianUser.role !== UserRole.TECHNICIAN) {
    throw new Error("User is not a technician");
  }

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: technicianUserId },
  });

  if (!profile) {
    return { average: 0, count: 0 };
  }

  const result = await prisma.review.aggregate({
    where: { booking: { technicianId: profile.id } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average: result._count.rating > 0 ? (result._avg.rating ?? 0) : Number(profile.rating),
    count: result._count.rating,
  };
}

export interface TechnicianUserOption {
  id: string;
  name: string;
  email: string;
  rating: number;
  ratingCount: number;
}

export async function listTechnicianUsers(): Promise<TechnicianUserOption[]> {
  const users = await prisma.user.findMany({
    where: { role: UserRole.TECHNICIAN },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return Promise.all(
    users.map(async (u) => {
      const rating = await getTechnicianRating(u.id);
      return { ...u, rating: rating.average, ratingCount: rating.count };
    }),
  );
}

export async function assignTechnicianToBooking(
  bookingId: string,
  technicianUserId: string,
): Promise<Booking> {
  const technicianUser = await prisma.user.findUnique({ where: { id: technicianUserId } });

  if (!technicianUser || technicianUser.role !== UserRole.TECHNICIAN) {
    throw new Error("Selected user is not a technician");
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw new Error("Booking not found");
  }

  const profile = await getOrCreateTechnicianProfile(technicianUser);

  const nextStatus =
    booking.status === BookingStatus.REQUESTED ? BookingStatus.ASSIGNED : booking.status;

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { technicianId: profile.id, status: nextStatus },
  });

  await prisma.bookingStatusEvent.create({
    data: { bookingId: booking.id, status: nextStatus, note: `Assigned to ${technicianUser.name}` },
  });

  try {
    await notify(booking.userId, NotificationType.BOOKING_STATUS_CHANGED, {
      title: `Technician assigned — ${booking.code}`,
      body: `${technicianUser.name} has been assigned to your booking.`,
    });
  } catch (err) {
    logger.error(`Failed to send technician-assigned notification for ${booking.code}: ${err}`);
  }

  return updated;
}
