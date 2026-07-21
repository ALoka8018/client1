import { prisma, type TechnicianApplication } from "@repo/database";
import type { CreateTechnicianApplicationInput } from "@repo/validation";
import { sendMail } from "./mailer.js";
import { logger } from "@repo/logger";

const SUPPORT_INBOX = process.env.SUPPORT_INBOX_EMAIL ?? "solutions@aiasengineering.com";

export async function createTechnicianApplication(
  input: CreateTechnicianApplicationInput,
): Promise<TechnicianApplication> {
  const application = await prisma.technicianApplication.create({ data: input });

  try {
    await sendMail({
      to: SUPPORT_INBOX,
      subject: `New Technician Application — ${application.name}`,
      html: `
        <p>New technician application received:</p>
        <ul>
          <li><strong>Name:</strong> ${application.name}</li>
          <li><strong>Email:</strong> ${application.email}</li>
          <li><strong>Phone:</strong> ${application.phone}</li>
          <li><strong>City:</strong> ${application.city}</li>
          <li><strong>Experience:</strong> ${application.experience}</li>
          <li><strong>Certifications:</strong> ${application.certifications ?? "—"}</li>
          <li><strong>Availability:</strong> ${application.availability}</li>
        </ul>
        <p>No auto-approval — review manually and reach out directly.</p>
      `,
      text: `New technician application from ${application.name} (${application.email}, ${application.phone}). City: ${application.city}. Experience: ${application.experience}. Availability: ${application.availability}.`,
    });
  } catch (err) {
    logger.error(`Failed to alert support inbox for technician application ${application.id}: ${err}`);
  }

  return application;
}
