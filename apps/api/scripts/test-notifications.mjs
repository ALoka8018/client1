import "dotenv/config";
import { prisma, InvoiceStatus } from "@repo/database";
import { createBooking } from "../src/lib/bookings.ts";
import { processRazorpayWebhook } from "../src/lib/payments.ts";
import { closePdfBrowser } from "../src/lib/invoice-pdf.ts";

const suffix = Math.random().toString(36).slice(2, 8);

const category = await prisma.serviceCategory.create({
  data: { key: `test-notify-${suffix}`, label: `Test Notify ${suffix}` },
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
    supabaseId: `test-notify-${suffix}`,
    email: `test-notify-${suffix}@example.com`,
    name: "Test Notify Customer",
  },
});

try {
  const bookingWithInvoice = await createBooking(user, {
    propertyType: "RESIDENTIAL",
    city: "Bhubaneswar",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    problemDescription: "Ceiling seepage near the bathroom wall.",
    serviceId: service.id,
  });

  console.log("Created booking:", bookingWithInvoice.code, "invoice:", bookingWithInvoice.invoice?.number);

  const notificationsAfterBooking = await prisma.notification.findMany({ where: { userId: user.id } });
  console.log(
    "Notifications after booking creation:",
    notificationsAfterBooking.map((n) => n.type),
  );

  if (!bookingWithInvoice.invoice) {
    throw new Error("Expected an invoice to be created");
  }

  const orderId = `order_test_${suffix}`;
  const paymentId = `pay_test_${suffix}`;
  await prisma.invoice.update({
    where: { id: bookingWithInvoice.invoice.id },
    data: { razorpayOrderId: orderId },
  });

  const result = await processRazorpayWebhook({
    event: "payment.captured",
    payload: { payment: { entity: { id: paymentId, order_id: orderId, status: "captured" } } },
  });
  console.log("Webhook processed:", result);

  const notificationsAfterPayment = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  console.log(
    "Notifications after payment:",
    notificationsAfterPayment.map((n) => ({ type: n.type, title: n.title })),
  );

  const hasBookingNotification = notificationsAfterPayment.some((n) => n.type === "BOOKING_STATUS_CHANGED");
  const hasInvoiceNotification = notificationsAfterPayment.some((n) => n.type === "INVOICE_PAID");
  console.log("Has BOOKING_STATUS_CHANGED notification:", hasBookingNotification);
  console.log("Has INVOICE_PAID notification:", hasInvoiceNotification);

  const invoiceAfter = await prisma.invoice.findUniqueOrThrow({ where: { id: bookingWithInvoice.invoice.id } });
  console.log("Invoice status after webhook:", invoiceAfter.status);
} finally {
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.webhookEvent.deleteMany({ where: { eventId: { contains: suffix } } });
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
