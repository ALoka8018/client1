import {
  prisma,
  UserRole,
  TechnicianApplicationStatus,
  type TechnicianApplication,
} from "@repo/database";
import type {
  CreateTechnicianApplicationInput,
  ReviewTechnicianApplicationInput,
} from "@repo/validation";
import { sendMail } from "./mailer.js";
import { logger } from "@repo/logger";
import { supabaseAdmin } from "./supabase.js";

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

export async function listTechnicianApplications(
  status?: TechnicianApplicationStatus,
): Promise<TechnicianApplication[]> {
  return prisma.technicianApplication.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
  });
}

async function getOrCreateSupabaseUserByEmail(email: string) {
  const { data: invited, error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(email);

  if (!inviteError) return invited.user;

  const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw listError;

  const existing = list.users.find((u) => u.email === email);
  if (!existing) throw inviteError;

  return existing;
}

export async function reviewTechnicianApplication(
  id: string,
  input: ReviewTechnicianApplicationInput,
): Promise<TechnicianApplication> {
  const application = await prisma.technicianApplication.findUnique({ where: { id } });
  if (!application) {
    throw new Error("Application not found");
  }
  if (application.status !== TechnicianApplicationStatus.PENDING) {
    throw new Error("Application has already been reviewed");
  }

  if (input.status === TechnicianApplicationStatus.REJECTED) {
    return prisma.technicianApplication.update({
      where: { id },
      data: { status: TechnicianApplicationStatus.REJECTED },
    });
  }

  const supabaseUser = await getOrCreateSupabaseUserByEmail(application.email);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { supabaseId: supabaseUser.id },
      update: { role: UserRole.TECHNICIAN, name: application.name, phone: application.phone },
      create: {
        supabaseId: supabaseUser.id,
        email: application.email,
        name: application.name,
        phone: application.phone,
        role: UserRole.TECHNICIAN,
      },
    });

    await tx.technicianProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    return tx.technicianApplication.update({
      where: { id },
      data: { status: TechnicianApplicationStatus.APPROVED },
    });
  });
}
