import "dotenv/config";
import crypto from "node:crypto";
import { prisma, InvoiceStatus } from "@repo/database";

const API_URL = process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;
const suffix = Math.random().toString(36).slice(2, 8);

function sign(rawBody) {
  return crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET ?? "")
    .update(rawBody)
    .digest("hex");
}

async function postWebhook(rawBody) {
  const res = await fetch(`${API_URL}/v1/payments/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-razorpay-signature": sign(rawBody),
    },
    body: rawBody,
  });
  return { status: res.status, body: await res.json() };
}

const category = await prisma.serviceCategory.create({
  data: { key: `test-webhook-${suffix}`, label: `Test Webhook ${suffix}` },
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
    supabaseId: `test-webhook-${suffix}`,
    email: `test-webhook-${suffix}@example.com`,
    name: "Test Webhook Customer",
  },
});
const property = await prisma.property.create({
  data: { userId: user.id, label: "Home", addressLine: "12 Test Lane", city: "Bhubaneswar", isPrimary: true },
});
const booking = await prisma.booking.create({
  data: {
    code: `BK-WEBHOOK-${suffix}`,
    userId: user.id,
    propertyId: property.id,
    serviceId: service.id,
    scheduledAt: new Date(),
    problemDescription: "Test booking for webhook smoke test.",
  },
});
const orderId = `order_test_${suffix}`;
const paymentId = `pay_test_${suffix}`;
const invoice = await prisma.invoice.create({
  data: {
    number: `INV-WEBHOOK-${suffix}`,
    bookingId: booking.id,
    userId: user.id,
    amount: 1999,
    status: InvoiceStatus.PENDING,
    razorpayOrderId: orderId,
  },
});

console.log("Created test invoice:", invoice.number, "status:", invoice.status);

try {
  const rejectedNoSig = await fetch(`${API_URL}/v1/payments/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event: "payment.captured" }),
  });
  console.log("No-signature request rejected:", rejectedNoSig.status === 400, `(got ${rejectedNoSig.status})`);

  const badSig = await fetch(`${API_URL}/v1/payments/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-razorpay-signature": "deadbeef" },
    body: JSON.stringify({ event: "payment.captured" }),
  });
  console.log("Bad-signature request rejected:", badSig.status === 400, `(got ${badSig.status})`);

  const capturedPayload = JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity: { id: paymentId, order_id: orderId, status: "captured" } } },
  });

  const first = await postWebhook(capturedPayload);
  console.log("First payment.captured call:", first.status, first.body);

  const afterFirst = await prisma.invoice.findUniqueOrThrow({ where: { id: invoice.id } });
  console.log("Invoice status after first webhook:", afterFirst.status, "pdfKey set:", Boolean(afterFirst.pdfKey));

  const second = await postWebhook(capturedPayload);
  console.log("Duplicate payment.captured call (idempotency check):", second.status, second.body);

  const failedPayload = JSON.stringify({
    event: "payment.failed",
    payload: { payment: { entity: { id: `${paymentId}_failed`, order_id: orderId, status: "failed" } } },
  });
  const failedResult = await postWebhook(failedPayload);
  console.log("payment.failed call:", failedResult.status, failedResult.body);
} finally {
  await prisma.webhookEvent.deleteMany({
    where: { eventId: { in: [`payment.captured:${paymentId}`, `payment.failed:${paymentId}_failed`] } },
  });
  await prisma.invoice.delete({ where: { id: invoice.id } });
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.property.delete({ where: { id: property.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.service.delete({ where: { id: service.id } });
  await prisma.serviceCategory.delete({ where: { id: category.id } });
  console.log("Cleaned up test data");
  await prisma.$disconnect();
}
