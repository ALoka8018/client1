import crypto from "node:crypto";
import { prisma, Prisma, InvoiceStatus, type Invoice, type User } from "@repo/database";
import { razorpay } from "./razorpay.js";
import { generateAndStoreInvoicePdf } from "./invoice-pdf.js";
import { notify, NotificationType } from "./notifications.js";
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

/**
 * Marks an invoice PAID and generates its PDF. Idempotent — called from both
 * the client's /v1/payments/verify confirmation and the payment.captured
 * webhook, whichever arrives first; the other becomes a no-op.
 */
async function markInvoicePaid(
  invoiceId: string,
  payment: { razorpayPaymentId: string; razorpaySignature?: string },
): Promise<Invoice> {
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });

  if (invoice.status === InvoiceStatus.PAID) {
    return invoice;
  }

  const paidInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: InvoiceStatus.PAID,
      paidAt: new Date(),
      razorpayPaymentId: payment.razorpayPaymentId,
      razorpaySignature: payment.razorpaySignature,
    },
  });

  try {
    await generateAndStoreInvoicePdf(paidInvoice.id);
  } catch (err) {
    logger.error(`Failed to generate invoice PDF for ${paidInvoice.number}: ${err}`);
  }

  try {
    await notify(paidInvoice.userId, NotificationType.INVOICE_PAID, {
      title: `Payment received — ${paidInvoice.number}`,
      body: `We've received your payment for invoice ${paidInvoice.number}. Your receipt is ready in the portal.`,
      email: {
        subject: `Payment Confirmed — ${paidInvoice.number}`,
        html: `
          <p>Thanks for your payment.</p>
          <p>Invoice <strong>${paidInvoice.number}</strong> is now marked as paid. You can download your invoice PDF from your account portal.</p>
          <p>— Seepage Doctor</p>
        `,
        text: `Invoice ${paidInvoice.number} is now paid. Download your invoice from the portal.`,
      },
    });
  } catch (err) {
    logger.error(`Failed to send invoice paid notification for ${paidInvoice.number}: ${err}`);
  }

  return paidInvoice;
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

  return markInvoicePaid(invoice.id, {
    razorpayPaymentId: payload.razorpayPaymentId,
    razorpaySignature: payload.razorpaySignature,
  });
}

export function verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET ?? "")
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  status: string;
}

interface RazorpayWebhookPayload {
  event: string;
  payload?: {
    payment?: {
      entity: RazorpayPaymentEntity;
    };
  };
}

function isWebhookPayload(value: unknown): value is RazorpayWebhookPayload {
  return typeof value === "object" && value !== null && "event" in value;
}

export async function processRazorpayWebhook(rawPayload: unknown): Promise<{ status: string }> {
  if (!isWebhookPayload(rawPayload)) {
    return { status: "ignored" };
  }

  const paymentEntity = rawPayload.payload?.payment?.entity;

  if (!paymentEntity) {
    return { status: "ignored" };
  }

  const eventId = `${rawPayload.event}:${paymentEntity.id}`;

  try {
    await prisma.webhookEvent.create({ data: { provider: "razorpay", eventId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { status: "already processed" };
    }
    throw err;
  }

  if (rawPayload.event === "payment.captured") {
    const invoice = await prisma.invoice.findFirst({
      where: { razorpayOrderId: paymentEntity.order_id },
    });

    if (!invoice) {
      logger.error(
        `payment.captured webhook for unknown order ${paymentEntity.order_id} (payment ${paymentEntity.id})`,
      );
      return { status: "invoice not found" };
    }

    await markInvoicePaid(invoice.id, { razorpayPaymentId: paymentEntity.id });
    return { status: "processed" };
  }

  if (rawPayload.event === "payment.failed") {
    logger.error(
      `payment.failed webhook for order ${paymentEntity.order_id} (payment ${paymentEntity.id})`,
    );
    return { status: "processed" };
  }

  return { status: "ignored" };
}
