import "dotenv/config";
import { prisma } from "@repo/database";
import { createBooking, listBookings, modifyBooking } from "../src/lib/bookings.ts";
import { closePdfBrowser } from "../src/lib/invoice-pdf.ts";

const suffix = Math.random().toString(36).slice(2, 8);

const category = await prisma.serviceCategory.create({
  data: { key: `test-events-${suffix}`, label: `Test Events ${suffix}` },
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
    supabaseId: `test-events-${suffix}`,
    email: `test-events-${suffix}@example.com`,
    name: "Test Events Customer",
  },
});

try {
  const created = await createBooking(user, {
    propertyType: "RESIDENTIAL",
    city: "Bhubaneswar",
    scheduledAt: new Date(Date.now() + 86400000),
    problemDescription: "Test problem.",
    serviceId: service.id,
  });

  await modifyBooking(user, created.id, {
    action: "reschedule",
    newDate: new Date(Date.now() + 3 * 86400000),
    reason: "Testing timeline",
  });

  const [booking] = await listBookings(user);
  console.log("Event count (initial + reschedule):", booking.statusEvents.length === 2);
  console.log(
    "Ascending order:",
    booking.statusEvents[0].createdAt.getTime() <= booking.statusEvents[1].createdAt.getTime(),
  );
  console.log(
    "Both at REQUESTED status:",
    booking.statusEvents.every((e) => e.status === "REQUESTED"),
  );
  console.log("Reschedule note captured:", booking.statusEvents[1].note === "Testing timeline");
} finally {
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.invoice.deleteMany({ where: { userId: user.id } });
  await prisma.bookingStatusEvent.deleteMany({ where: { booking: { userId: user.id } } });
  await prisma.booking.deleteMany({ where: { userId: user.id } });
  await prisma.property.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.service.delete({ where: { id: service.id } });
  await prisma.serviceCategory.delete({ where: { id: category.id } });
  console.log("Cleaned up test data");
  await closePdfBrowser();
  await prisma.$disconnect();
}
