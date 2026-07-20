import crypto from "node:crypto";
import { prisma, InvoiceStatus, type Invoice, type User } from "@repo/database";
import { razorpay } from "./razorpay.js";
import { generateAndStoreInvoicePdf } from "./invoice-pdf.js";
import { logger } from "@repo/logger";

export async function createPaymentOrder(user: User, invoiceId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId: user.id },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.status !== InvoiceStatus.PENDING) {
    throw new Error("Invoice is not payable");
  }

  const amountInPaise = Math.round(Number(invoice.amount) * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: invoice.number,
    notes: { invoiceId: invoice.id, userId: user.id },
  });

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { razorpayOrderId: order.id },
  });

  return {
    orderId: order.id,
    amount: amountInPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    invoiceNumber: invoice.number,
  };
}

export async function verifyPayment(
  user: User,
  payload: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
): Promise<Invoice> {
  const invoice = await prisma.invoice.findFirst({
    where: { razorpayOrderId: payload.razorpayOrderId, userId: user.id },
  });

  if (!invoice) {
    throw new Error("Invoice not found for this order");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(`${payload.razorpayOrderId}|${payload.razorpayPaymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(payload.razorpaySignature);

  const isValid =
    expectedBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, actualBuffer);

  if (!isValid) {
    throw new Error("Payment signature verification failed");
  }

  const paidInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: InvoiceStatus.PAID,
      paidAt: new Date(),
      razorpayPaymentId: payload.razorpayPaymentId,
      razorpaySignature: payload.razorpaySignature,
    },
  });

  try {
    await generateAndStoreInvoicePdf(paidInvoice.id);
  } catch (err) {
    logger.error(`Failed to generate invoice PDF for ${paidInvoice.number}: ${err}`);
  }

  return paidInvoice;
}
