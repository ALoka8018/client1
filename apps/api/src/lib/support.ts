import { prisma, type SupportTicket, type User } from "@repo/database";
import type { CreateSupportTicketInput } from "@repo/validation";
import { notify, NotificationType } from "./notifications.js";
import { sendMail } from "./mailer.js";
import { logger } from "@repo/logger";

const SUPPORT_INBOX = process.env.SUPPORT_INBOX_EMAIL ?? "solutions@aiasengineering.com";

export async function createSupportTicket(
  user: User,
  input: CreateSupportTicketInput,
): Promise<SupportTicket> {
  const ticket = await prisma.supportTicket.create({
    data: { userId: user.id, topic: input.topic, message: input.message },
  });

  try {
    await notify(user.id, NotificationType.SUPPORT_TICKET_REPLY, {
      title: "Support ticket received",
      body: `We've received your ticket about "${ticket.topic}" and will get back to you shortly.`,
      email: {
        subject: `Support Ticket Received — ${ticket.topic}`,
        html: `
          <p>Hi ${user.name},</p>
          <p>We've received your support ticket:</p>
          <p><strong>Topic:</strong> ${ticket.topic}</p>
          <p><strong>Message:</strong> ${ticket.message}</p>
          <p>Our team will get back to you shortly.</p>
          <p>— Seepage Doctor</p>
        `,
        text: `We've received your support ticket about "${ticket.topic}". Our team will get back to you shortly.`,
      },
    });
  } catch (err) {
    logger.error(`Failed to send support ticket confirmation for ${ticket.id}: ${err}`);
  }

  try {
    await sendMail({
      to: SUPPORT_INBOX,
      subject: `New Support Ticket — ${ticket.topic}`,
      html: `
        <p>New support ticket from ${user.name} (${user.email}):</p>
        <p><strong>Topic:</strong> ${ticket.topic}</p>
        <p><strong>Message:</strong> ${ticket.message}</p>
      `,
      text: `New support ticket from ${user.name} (${user.email}). Topic: ${ticket.topic}. Message: ${ticket.message}`,
    });
  } catch (err) {
    logger.error(`Failed to alert support inbox for ticket ${ticket.id}: ${err}`);
  }

  return ticket;
}

export async function listSupportTickets(user: User): Promise<SupportTicket[]> {
  return prisma.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}
