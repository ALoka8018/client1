import { Hono } from "hono";
import { logger } from "@repo/logger";
import { prisma, InvoiceStatus } from "@repo/database";
import { createPaymentOrderSchema, verifyPaymentSchema } from "@repo/validation";
import { createStorageDriver } from "@repo/storage";
import { requireAuth, isAdminRole, type AuthEnv } from "../common/auth.js";
import {
  createPaymentOrder,
  verifyPayment,
  verifyWebhookSignature,
  processRazorpayWebhook,
} from "./payments.js";
import { generateAndStoreInvoicePdf } from "./invoice-pdf.js";

export const paymentsRoutes = new Hono<AuthEnv>();

paymentsRoutes.get("/v1/invoices", requireAuth, async (c) => {
  const invoices = await prisma.invoice.findMany({
    where: { userId: c.get("user").id },
    include: { booking: { select: { code: true, scheduledAt: true } } },
    orderBy: { issuedAt: "desc" },
  });
  return c.json(invoices);
});

paymentsRoutes.get("/v1/invoices/:number/pdf", requireAuth, async (c) => {
  const user = c.get("user");
  const number = c.req.param("number");

  const invoice = await prisma.invoice.findUnique({ where: { number } });

  if (!invoice || (invoice.userId !== user.id && !isAdminRole(user.role))) {
    return c.json({ error: "Invoice not found" }, 404);
  }

  if (invoice.status !== InvoiceStatus.PAID) {
    return c.json({ error: "Invoice PDF is not available until payment is confirmed" }, 404);
  }

  let pdfKey = invoice.pdfKey;

  if (!pdfKey) {
    try {
      pdfKey = await generateAndStoreInvoicePdf(invoice.id);
    } catch (err) {
      return c.json(
        { error: err instanceof Error ? err.message : "Unable to generate invoice PDF" },
        500,
      );
    }
  }

  const expiresInSeconds = 5 * 60;
  const url = await createStorageDriver().getUrl(pdfKey, {
    expiresInSeconds,
    downloadFilename: `${invoice.number}.pdf`,
  });

  return c.json({ url, expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString() });
});

paymentsRoutes.post("/v1/payments/orders", requireAuth, async (c) => {
  const parsed = createPaymentOrderSchema.safeParse(await c.req.json());

  if (!parsed.success) {
    return c.json({ error: "Invalid payment order payload", issues: parsed.error.issues }, 400);
  }

  try {
    const order = await createPaymentOrder(c.get("user"), parsed.data.invoiceId);
    return c.json(order);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Unable to create order" }, 400);
  }
});

paymentsRoutes.post("/v1/payments/verify", requireAuth, async (c) => {
  const parsed = verifyPaymentSchema.safeParse(await c.req.json());

  if (!parsed.success) {
    return c.json({ error: "Invalid payment verification payload", issues: parsed.error.issues }, 400);
  }

  try {
    const invoice = await verifyPayment(c.get("user"), parsed.data);
    return c.json(invoice);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Unable to verify payment" }, 400);
  }
});

paymentsRoutes.post("/v1/payments/webhook", async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header("x-razorpay-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return c.json({ error: "Invalid webhook signature" }, 400);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return c.json({ error: "Invalid JSON payload" }, 400);
  }

  try {
    const result = await processRazorpayWebhook(payload);
    return c.json(result);
  } catch (err) {
    logger.error(`Failed to process Razorpay webhook: ${err}`);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});
