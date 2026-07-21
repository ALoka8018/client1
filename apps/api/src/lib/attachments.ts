import { randomUUID } from "node:crypto";
import { prisma, type BookingAttachment } from "@repo/database";
import { createStorageDriver } from "@repo/storage";

export interface UploadAttachmentInput {
  bookingId: string;
  fileName: string;
  mimeType: string;
  data: Buffer;
  photoType?: "BEFORE" | "AFTER";
  featured: boolean;
  consent: boolean;
}

/**
 * Admin-only upload (gated by requireRole(ADMIN) at the route level) — the
 * short-term stopgap for populating job photos until a technician app
 * (Phase 3) exists. `featured` can only be true when `consent` is true —
 * enforced here, not just in the UI, since this determines public visibility.
 */
export async function uploadBookingAttachment(
  input: UploadAttachmentInput,
): Promise<BookingAttachment> {
  const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
  if (!booking) {
    throw new Error("Booking not found");
  }

  const featured = input.featured && input.consent;
  const key = `bookings/${input.bookingId}/attachments/${randomUUID()}-${input.fileName}`;

  await createStorageDriver().upload(key, input.data, { contentType: input.mimeType });

  return prisma.bookingAttachment.create({
    data: {
      bookingId: input.bookingId,
      fileKey: key,
      fileName: input.fileName,
      mimeType: input.mimeType,
      photoType: input.photoType,
      featured,
      consentedAt: input.consent ? new Date() : null,
    },
  });
}

export interface AdminBookingListItem {
  id: string;
  code: string;
  status: string;
  userEmail: string;
  serviceTitle: string | null;
}

export async function listAllBookingsForAdmin(): Promise<AdminBookingListItem[]> {
  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { email: true } },
      service: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return bookings.map((b) => ({
    id: b.id,
    code: b.code,
    status: b.status,
    userEmail: b.user.email,
    serviceTitle: b.service?.title ?? null,
  }));
}

export async function listBookingAttachmentsForAdmin(bookingId: string) {
  const attachments = await prisma.bookingAttachment.findMany({
    where: { bookingId },
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    attachments.map(async (a) => ({
      id: a.id,
      fileName: a.fileName,
      photoType: a.photoType,
      featured: a.featured,
      consentedAt: a.consentedAt,
      url: await createStorageDriver().getUrl(a.fileKey, { expiresInSeconds: 5 * 60 }),
    })),
  );
}

export interface GalleryPair {
  bookingId: string;
  bookingCode: string;
  serviceTitle: string | null;
  beforeUrl: string;
  afterUrl: string;
}

/** Only bookings with BOTH a featured+consented BEFORE and AFTER photo qualify — the slider needs both. */
export async function getProjectGallery(): Promise<GalleryPair[]> {
  const attachments = await prisma.bookingAttachment.findMany({
    where: { featured: true, consentedAt: { not: null } },
    include: { booking: { select: { code: true, service: { select: { title: true } } } } },
  });

  const byBooking = new Map<string, typeof attachments>();
  for (const attachment of attachments) {
    const list = byBooking.get(attachment.bookingId) ?? [];
    list.push(attachment);
    byBooking.set(attachment.bookingId, list);
  }

  const storage = createStorageDriver();
  const pairs: GalleryPair[] = [];

  for (const [bookingId, items] of byBooking) {
    const before = items.find((a) => a.photoType === "BEFORE");
    const after = items.find((a) => a.photoType === "AFTER");
    if (!before || !after) continue;

    pairs.push({
      bookingId,
      bookingCode: before.booking.code,
      serviceTitle: before.booking.service?.title ?? null,
      beforeUrl: await storage.getUrl(before.fileKey, { expiresInSeconds: 60 * 60 }),
      afterUrl: await storage.getUrl(after.fileKey, { expiresInSeconds: 60 * 60 }),
    });
  }

  return pairs;
}
