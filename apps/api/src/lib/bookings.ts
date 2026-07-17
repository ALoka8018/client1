import { prisma, type Booking, type User } from "@repo/database";
import type { CreateBookingInput } from "@repo/validation";
import { sendMail } from "./mailer.js";
import { logger } from "@repo/logger";

function generateBookingCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BK-${Date.now().toString(36).toUpperCase()}-${random}`;
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

function bookingConfirmationEmail(booking: Booking, user: User) {
  const scheduledLabel = booking.scheduledAt.toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return {
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
      <p>— AIAS Engineering</p>
    `,
    text: `Hi ${user.name}, your booking ${booking.code} is scheduled for ${scheduledLabel}. Issue: ${booking.problemDescription}`,
  };
}

export async function createBooking(user: User, input: CreateBookingInput): Promise<Booking> {
  const property = await findOrCreateProperty(user, input);

  if (input.phone && input.phone !== user.phone) {
    await prisma.user.update({ where: { id: user.id }, data: { phone: input.phone } });
  }

  const booking = await prisma.booking.create({
    data: {
      code: generateBookingCode(),
      userId: user.id,
      propertyId: property.id,
      scheduledAt: input.scheduledAt,
      problemDescription: input.problemDescription,
    },
  });

  await prisma.bookingStatusEvent.create({
    data: { bookingId: booking.id, status: booking.status },
  });

  try {
    const { subject, html, text } = bookingConfirmationEmail(booking, user);
    await sendMail({ to: user.email, subject, html, text });
  } catch (err) {
    logger.error(`Failed to send booking confirmation email for ${booking.code}: ${err}`);
  }

  return booking;
}
