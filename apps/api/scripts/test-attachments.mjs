import "dotenv/config";
import { prisma } from "@repo/database";
import {
  uploadBookingAttachment,
  listAllBookingsForAdmin,
  listBookingAttachmentsForAdmin,
  getProjectGallery,
} from "../src/lib/attachments.ts";
import { createStorageDriver } from "@repo/storage";

const suffix = Math.random().toString(36).slice(2, 8);

const category = await prisma.serviceCategory.create({
  data: { key: `test-attach-${suffix}`, label: `Test Attach ${suffix}` },
});
const service = await prisma.service.create({
  data: {
    categoryId: category.id,
    title: "Leak Detection & Repair",
    description: "Diagnostic leak detection with repair.",
    priceLabel: "Starting at ₹1,999",
    priceAmount: 1999,
  },
});
const user = await prisma.user.create({
  data: {
    supabaseId: `test-attach-${suffix}`,
    email: `test-attach-${suffix}@example.com`,
    name: "Test Attachment Customer",
  },
});
const property = await prisma.property.create({
  data: { userId: user.id, label: "Home", addressLine: "12 Test Lane", city: "Bhubaneswar", isPrimary: true },
});
const booking = await prisma.booking.create({
  data: {
    code: `BK-ATTACH-${suffix}`,
    userId: user.id,
    propertyId: property.id,
    serviceId: service.id,
    status: "COMPLETED",
    scheduledAt: new Date(),
    problemDescription: "Test problem.",
  },
});
const bookingNoAfter = await prisma.booking.create({
  data: {
    code: `BK-ATTACH-SOLO-${suffix}`,
    userId: user.id,
    propertyId: property.id,
    serviceId: service.id,
    status: "COMPLETED",
    scheduledAt: new Date(),
    problemDescription: "Test problem, only before photo.",
  },
});

const fakeImage = Buffer.from("fake-image-bytes-for-testing");
const uploadedKeys = [];

try {
  // Featured requested without consent -> server forces featured=false.
  const noConsentAttachment = await uploadBookingAttachment({
    bookingId: booking.id,
    fileName: "before-no-consent.jpg",
    mimeType: "image/jpeg",
    data: fakeImage,
    photoType: "BEFORE",
    featured: true,
    consent: false,
  });
  uploadedKeys.push(noConsentAttachment.fileKey);
  console.log(
    "Featured forced false without consent:",
    noConsentAttachment.featured === false && noConsentAttachment.consentedAt === null,
  );

  // Real featured pair.
  const before = await uploadBookingAttachment({
    bookingId: booking.id,
    fileName: "before.jpg",
    mimeType: "image/jpeg",
    data: fakeImage,
    photoType: "BEFORE",
    featured: true,
    consent: true,
  });
  uploadedKeys.push(before.fileKey);
  const after = await uploadBookingAttachment({
    bookingId: booking.id,
    fileName: "after.jpg",
    mimeType: "image/jpeg",
    data: fakeImage,
    photoType: "AFTER",
    featured: true,
    consent: true,
  });
  uploadedKeys.push(after.fileKey);
  console.log("Consented featured photo has consentedAt:", before.consentedAt !== null);

  // Solo BEFORE-only booking, featured but incomplete pair.
  const solo = await uploadBookingAttachment({
    bookingId: bookingNoAfter.id,
    fileName: "solo-before.jpg",
    mimeType: "image/jpeg",
    data: fakeImage,
    photoType: "BEFORE",
    featured: true,
    consent: true,
  });
  uploadedKeys.push(solo.fileKey);

  const gallery = await getProjectGallery();
  const pair = gallery.find((g) => g.bookingId === booking.id);
  const soloInGallery = gallery.some((g) => g.bookingId === bookingNoAfter.id);
  console.log("Complete pair appears in gallery:", Boolean(pair));
  console.log("Incomplete (solo) pair excluded from gallery:", !soloInGallery);
  console.log("Gallery entry has real signed URLs:", pair?.beforeUrl.includes("storage.googleapis.com"));

  const adminBookings = await listAllBookingsForAdmin();
  console.log("Admin bookings list includes our test booking:", adminBookings.some((b) => b.id === booking.id));

  const adminAttachments = await listBookingAttachmentsForAdmin(booking.id);
  console.log("Admin attachment list count for booking:", adminAttachments.length === 3);

  const rejectedBooking = await uploadBookingAttachment({
    bookingId: "nonexistent-booking-id",
    fileName: "x.jpg",
    mimeType: "image/jpeg",
    data: fakeImage,
    featured: false,
    consent: false,
  }).catch((err) => err);
  console.log("Rejects unknown booking:", rejectedBooking instanceof Error);
} finally {
  const storage = createStorageDriver();
  for (const key of uploadedKeys) {
    await storage.delete(key).catch(() => {});
  }
  await prisma.bookingAttachment.deleteMany({ where: { booking: { userId: user.id } } });
  await prisma.booking.deleteMany({ where: { userId: user.id } });
  await prisma.property.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.service.delete({ where: { id: service.id } });
  await prisma.serviceCategory.delete({ where: { id: category.id } });
  console.log("Cleaned up test data");
  await prisma.$disconnect();
}
