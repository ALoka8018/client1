import "dotenv/config";
import { prisma, InvoiceStatus, BookingStatus } from "@repo/database";
import { createBooking, listBookings, modifyBooking } from "../src/lib/bookings.ts";
import { closePdfBrowser } from "../src/lib/invoice-pdf.ts";

const suffix = Math.random().toString(36).slice(2, 8);

const category = await prisma.serviceCategory.create({
  data: { key: `test-modify-${suffix}`, label: `Test Modify ${suffix}` },
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
    supabaseId: `test-modify-${suffix}`,
    email: `test-modify-${suffix}@example.com`,
    name: "Test Modify Customer",
  },
});

try {
  const { invoice, ...booking } = await createBooking(user, {
    propertyType: "RESIDENTIAL",
    city: "Bhubaneswar",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    problemDescription: "Ceiling seepage near the bathroom wall.",
    serviceId: service.id,
  });
  console.log("Created booking:", booking.code, "status:", booking.status, "invoice:", invoice?.status);

  const listed = await listBookings(user);
  console.log("listBookings returns booking:", listed.some((b) => b.id === booking.id));

  const newDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const rescheduled = await modifyBooking(user, booking.id, {
    action: "reschedule",
    newDate,
    reason: "Customer requested a later slot",
  });
  console.log(
    "Rescheduled scheduledAt matches:",
    rescheduled.scheduledAt.getTime() === newDate.getTime(),
    "status unchanged:",
    rescheduled.status === BookingStatus.REQUESTED,
  );

  const cancelled = await modifyBooking(user, booking.id, {
    action: "cancel",
    reason: "Found another provider",
  });
  console.log("Cancelled status:", cancelled.status === BookingStatus.CANCELLED);

  const invoiceAfterCancel = await prisma.invoice.findUniqueOrThrow({ where: { id: invoice.id } });
  console.log("Invoice voided on cancel:", invoiceAfterCancel.status === InvoiceStatus.VOID);

  let rejectedAfterCancel = false;
  try {
    await modifyBooking(user, booking.id, { action: "cancel" });
  } catch (err) {
    rejectedAfterCancel = true;
    console.log("Re-cancelling an already-cancelled booking rejected:", err.message);
  }
  console.log("Rejected re-cancel:", rejectedAfterCancel);

  const events = await prisma.bookingStatusEvent.findMany({ where: { bookingId: booking.id } });
  console.log(
    "BookingStatusEvent count (initial + reschedule + cancel):",
    events.length,
    events.map((e) => e.status),
  );

  const notifications = await prisma.notification.findMany({ where: { userId: user.id } });
  console.log(
    "Notifications:",
    notifications.map((n) => n.title),
  );
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
