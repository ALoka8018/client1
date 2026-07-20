import { prisma } from "@repo/database";
import { sendMail } from "./mailer.js";
import { logger } from "@repo/logger";

export const NotificationType = {
  BOOKING_STATUS_CHANGED: "BOOKING_STATUS_CHANGED",
  INVOICE_PAID: "INVOICE_PAID",
  SUPPORT_TICKET_REPLY: "SUPPORT_TICKET_REPLY",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface NotifyInput {
  title: string;
  body: string;
  email?: {
    subject: string;
    html: string;
    text?: string;
  };
}

/**
 * Records an in-app notification and, if requested, fans out to email.
 * Email failures are logged but never block the notification record or
 * the caller's main flow (booking creation, payment confirmation, etc.).
 */
export async function notify(userId: string, type: NotificationType, input: NotifyInput): Promise<void> {
  await prisma.notification.create({
    data: { userId, type, title: input.title, body: input.body },
  });

  if (!input.email) return;

  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    await sendMail({ to: user.email, ...input.email });
  } catch (err) {
    logger.error(`Failed to send notification email (${type}) to user ${userId}: ${err}`);
  }
}
