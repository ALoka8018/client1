import {
  prisma,
  InvoiceStatus,
  BookingStatus,
  Prisma,
  type Booking,
  type Invoice,
  type User,
} from "@repo/database";
import type { CreateBookingInput, ModifyBookingInput } from "@repo/validation";
import { notify, NotificationType } from "./notifications.js";
import { logger } from "@repo/logger";

const CANCELLABLE_STATUSES: BookingStatus[] = [
  BookingStatus.REQUESTED,
  BookingStatus.CONFIRMED,
  BookingStatus.ASSIGNED,
  BookingStatus.EN_ROUTE,
];

const RESCHEDULABLE_STATUSES: BookingStatus[] = [
  BookingStatus.REQUESTED,
  BookingStatus.CONFIRMED,
  BookingStatus.ASSIGNED,
];

function generateBookingCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BK-${Date.now().toString(36).toUpperCase()}-${random}`;
}

function generateInvoiceNumber() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${Date.now().toString(36).toUpperCase()}-${random}`;
}

async function findOrCreateProperty(user: User, input: CreateBookingInput) {
  const existing = await prisma.property.findFirst({
    where: { userId: user.id, city: input.city, propertyType: input.propertyType },
  });

  if (existing) return existing;

  const propertyCount = await prisma.property.count({ where: { userId: user.id } });

  return prisma.property.create({
    data: {
      userId: user.id,
      label: `${input.city} ${input.propertyType.charAt(0)}${input.propertyType.slice(1).toLowerCase()}`,
      addressLine: input.city,
      city: input.city,
      propertyType: input.propertyType,
      isPrimary: propertyCount === 0,
    },
  });
}

function bookingConfirmationNotification(booking: Booking, user: User) {
  const scheduledLabel = booking.scheduledAt.toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return {
    title: `Booking confirmed — ${booking.code}`,
    body: `Scheduled for ${scheduledLabel}.`,
    email: {
      subject: `Booking Confirmed — ${booking.code}`,
      html: `
        <p>Hi ${user.name},</p>
        <p>Your service request has been received. Here are the details:</p>
        <ul>
          <li><strong>Booking code:</strong> ${booking.code}</li>
          <li><strong>Scheduled for:</strong> ${scheduledLabel}</li>
          <li><strong>Issue:</strong> ${booking.problemDescription}</li>
        </ul>
        <p>Our team will confirm your visit shortly by phone or email.</p>
        <p>— Seepage Leakage All Solutions</p>
      `,
      text: `Hi ${user.name}, your booking ${booking.code} is scheduled for ${scheduledLabel}. Issue: ${booking.problemDescription}`,
    },
  };
}

export async function createBooking(
  user: User,
  input: CreateBookingInput,
): Promise<Booking & { invoice: Invoice | null }> {
  const property = await findOrCreateProperty(user, input);

  if (input.phone && input.phone !== user.phone) {
    await prisma.user.update({ where: { id: user.id }, data: { phone: input.phone } });
  }

  const booking = await prisma.booking.create({
    data: {
      code: generateBookingCode(),
      userId: user.id,
      propertyId: property.id,
      serviceId: input.serviceId,
      scheduledAt: input.scheduledAt,
      problemDescription: input.problemDescription,
    },
  });

  await prisma.bookingStatusEvent.create({
    data: { bookingId: booking.id, status: booking.status },
  });

  let invoice: Invoice | null = null;

  if (input.serviceId) {
    const service = await prisma.service.findUnique({ where: { id: input.serviceId } });

    if (service) {
      invoice = await prisma.invoice.create({
        data: {
          number: generateInvoiceNumber(),
          bookingId: booking.id,
          userId: user.id,
          amount: service.priceAmount,
          status: InvoiceStatus.PENDING,
        },
      });
    }
  }

  try {
    await notify(
      user.id,
      NotificationType.BOOKING_STATUS_CHANGED,
      bookingConfirmationNotification(booking, user),
    );
  } catch (err) {
    logger.error(`Failed to send booking confirmation notification for ${booking.code}: ${err}`);
  }

  return { ...booking, invoice };
}

export type BookingListItem = Booking & {
  service: { title: string } | null;
  property: { addressLine: string; city: string };
  invoice: { id: string; number: string; status: InvoiceStatus; amount: Prisma.Decimal } | null;
  review: { id: string; rating: number } | null;
  statusEvents: { status: BookingStatus; note: string | null; createdAt: Date }[];
};

export async function listBookings(user: User): Promise<BookingListItem[]> {
  return prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      service: { select: { title: true } },
      property: { select: { addressLine: true, city: true } },
      invoice: { select: { id: true, number: true, status: true, amount: true } },
      review: { select: { id: true, rating: true } },
      statusEvents: {
        select: { status: true, note: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

function bookingModifiedNotification(
  booking: Booking,
  action: "reschedule" | "cancel",
  reason?: string,
) {
  if (action === "reschedule") {
    const scheduledLabel = booking.scheduledAt.toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
    });

    return {
      title: `Booking rescheduled — ${booking.code}`,
      body: `New time: ${scheduledLabel}.`,
      email: {
        subject: `Booking Rescheduled — ${booking.code}`,
        html: `
          <p>Your booking <strong>${booking.code}</strong> has been rescheduled to <strong>${scheduledLabel}</strong>.</p>
          ${reason ? `<p>Reason: ${reason}</p>` : ""}
          <p>— Seepage Leakage All Solutions</p>
        `,
        text: `Booking ${booking.code} rescheduled to ${scheduledLabel}.${reason ? ` Reason: ${reason}` : ""}`,
      },
    };
  }

  return {
    title: `Booking cancelled — ${booking.code}`,
    body: reason ? `Reason: ${reason}` : "Your booking has been cancelled.",
    email: {
      subject: `Booking Cancelled — ${booking.code}`,
      html: `
        <p>Your booking <strong>${booking.code}</strong> has been cancelled.</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ""}
        <p>— Seepage Leakage All Solutions</p>
      `,
      text: `Booking ${booking.code} cancelled.${reason ? ` Reason: ${reason}` : ""}`,
    },
  };
}

/**
 * Reschedules or cancels a booking. Cancelling voids a PENDING invoice (no
 * refund flow exists yet, so a PAID invoice is left for admin tooling to
 * handle later) and always writes a BookingStatusEvent + notification.
 */
export async function modifyBooking(
  user: User,
  bookingId: string,
  input: ModifyBookingInput,
): Promise<Booking> {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: user.id },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (input.action === "cancel") {
    if (!CANCELLABLE_STATUSES.includes(booking.status)) {
      throw new Error(`Booking cannot be cancelled while ${booking.status}`);
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.CANCELLED },
    });

    await prisma.bookingStatusEvent.create({
      data: { bookingId: booking.id, status: BookingStatus.CANCELLED, note: input.reason },
    });

    await prisma.invoice.updateMany({
      where: { bookingId: booking.id, status: InvoiceStatus.PENDING },
      data: { status: InvoiceStatus.VOID },
    });

    try {
      await notify(
        user.id,
        NotificationType.BOOKING_STATUS_CHANGED,
        bookingModifiedNotification(updated, "cancel", input.reason),
      );
    } catch (err) {
      logger.error(`Failed to send booking cancellation notification for ${updated.code}: ${err}`);
    }

    return updated;
  }

  if (!RESCHEDULABLE_STATUSES.includes(booking.status)) {
    throw new Error(`Booking cannot be rescheduled while ${booking.status}`);
  }

  if (!input.newDate) {
    throw new Error("newDate is required to reschedule a booking");
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { scheduledAt: input.newDate },
  });

  await prisma.bookingStatusEvent.create({
    data: { bookingId: booking.id, status: updated.status, note: input.reason ?? "Rescheduled" },
  });

  try {
    await notify(
      user.id,
      NotificationType.BOOKING_STATUS_CHANGED,
      bookingModifiedNotification(updated, "reschedule", input.reason),
    );
  } catch (err) {
    logger.error(`Failed to send booking reschedule notification for ${updated.code}: ${err}`);
  }

  return updated;
}
