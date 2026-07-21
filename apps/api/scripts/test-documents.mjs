import "dotenv/config";
import { prisma, InvoiceStatus } from "@repo/database";
import { listDocuments } from "../src/lib/documents.ts";

const suffix = Math.random().toString(36).slice(2, 8);

const category = await prisma.serviceCategory.create({
  data: { key: `test-doc-${suffix}`, label: `Test Doc ${suffix}` },
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
    supabaseId: `test-doc-${suffix}`,
    email: `test-doc-${suffix}@example.com`,
    name: "Test Documents Customer",
  },
});
const property = await prisma.property.create({
  data: { userId: user.id, label: "Home", addressLine: "12 Test Lane", city: "Bhubaneswar", isPrimary: true },
});

async function makeBookingWithInvoice(status, code, invoiceStatus) {
  const booking = await prisma.booking.create({
    data: {
      code,
      userId: user.id,
      propertyId: property.id,
      serviceId: service.id,
      status,
      scheduledAt: new Date(),
      problemDescription: "Test problem.",
    },
  });
  const invoice = await prisma.invoice.create({
    data: {
      number: `INV-DOC-${code}`,
      bookingId: booking.id,
      userId: user.id,
      amount: 1999,
      status: invoiceStatus,
      paidAt: invoiceStatus === "PAID" ? new Date() : null,
    },
  });
  return { booking, invoice };
}

try {
  const empty = await listDocuments(user);
  console.log("Empty state:", empty.invoices.length === 0 && empty.attachments.length === 0);

  const paid = await makeBookingWithInvoice("COMPLETED", `${suffix}-PAID`, InvoiceStatus.PAID);
  const pending = await makeBookingWithInvoice("REQUESTED", `${suffix}-PENDING`, InvoiceStatus.PENDING);

  const withInvoices = await listDocuments(user);
  console.log("Only PAID invoice included:", withInvoices.invoices.length === 1);
  console.log("Correct invoice number:", withInvoices.invoices[0].number === paid.invoice.number);
  console.log("Booking code attached:", withInvoices.invoices[0].bookingCode === paid.booking.code);
  console.log("Pending invoice excluded:", !withInvoices.invoices.some((i) => i.number === pending.invoice.number));

  await prisma.bookingAttachment.create({
    data: {
      bookingId: paid.booking.id,
      fileUrl: "https://example.com/report.pdf",
      fileName: "Inspection Report.pdf",
      mimeType: "application/pdf",
    },
  });

  const withAttachment = await listDocuments(user);
  console.log("Attachment included:", withAttachment.attachments.length === 1);
  console.log("Attachment booking code correct:", withAttachment.attachments[0].bookingCode === paid.booking.code);
} finally {
  await prisma.bookingAttachment.deleteMany({ where: { booking: { userId: user.id } } });
  await prisma.invoice.deleteMany({ where: { userId: user.id } });
  await prisma.booking.deleteMany({ where: { userId: user.id } });
  await prisma.property.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.service.delete({ where: { id: service.id } });
  await prisma.serviceCategory.delete({ where: { id: category.id } });
  console.log("Cleaned up test data");
  await prisma.$disconnect();
}
