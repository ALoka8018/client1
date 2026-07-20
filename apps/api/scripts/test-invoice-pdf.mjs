import "dotenv/config";
import { prisma, InvoiceStatus } from "@repo/database";
import {
  generateAndStoreInvoicePdf,
  closePdfBrowser,
} from "../src/lib/invoice-pdf.ts";
import { createStorageDriver } from "@repo/storage";

const suffix = Math.random().toString(36).slice(2, 8);

const category = await prisma.serviceCategory.create({
  data: { key: `test-category-${suffix}`, label: `Test Category ${suffix}` },
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
    supabaseId: `test-${suffix}`,
    email: `test-${suffix}@example.com`,
    name: "Test Customer",
  },
});
const property = await prisma.property.create({
  data: {
    userId: user.id,
    label: "Home",
    addressLine: "12 Test Lane",
    city: "Bhubaneswar",
    isPrimary: true,
  },
});
const booking = await prisma.booking.create({
  data: {
    code: `BK-TEST-${suffix}`,
    userId: user.id,
    propertyId: property.id,
    serviceId: service.id,
    scheduledAt: new Date(),
    problemDescription: "Ceiling seepage near the bathroom wall.",
  },
});
const invoice = await prisma.invoice.create({
  data: {
    number: `INV-TEST-${suffix}`,
    bookingId: booking.id,
    userId: user.id,
    amount: 1999,
    status: InvoiceStatus.PAID,
    paidAt: new Date(),
  },
});

console.log("Created test invoice:", invoice.number);

try {
  const key = await generateAndStoreInvoicePdf(invoice.id);
  console.log("Stored PDF at key:", key);

  const url = await createStorageDriver().getUrl(key, {
    expiresInSeconds: 60,
    downloadFilename: `${invoice.number}.pdf`,
  });
  console.log("Signed URL:", url);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  console.log("Downloaded PDF bytes:", buf.length);
  console.log("Starts with %PDF:", buf.subarray(0, 5).toString() === "%PDF-");

  await createStorageDriver().delete(key);
  console.log("Deleted PDF from storage");
} finally {
  await prisma.invoice.delete({ where: { id: invoice.id } });
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.property.delete({ where: { id: property.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.service.delete({ where: { id: service.id } });
  await prisma.serviceCategory.delete({ where: { id: category.id } });
  console.log("Cleaned up test data");
  await closePdfBrowser();
  await prisma.$disconnect();
}
