import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "@repo/logger";
import { prisma, InvoiceStatus, UserRole } from "@repo/database";
import {
  createBookingSchema,
  createPaymentOrderSchema,
  verifyPaymentSchema,
  modifyBookingSchema,
} from "@repo/validation";
import { createStorageDriver } from "@repo/storage";
import { requireAuth, type AuthEnv } from "./middleware/auth.js";
import { createBooking, listBookings, modifyBooking } from "./lib/bookings.js";
import {
  createPaymentOrder,
  verifyPayment,
  verifyWebhookSignature,
  processRazorpayWebhook,
} from "./lib/payments.js";
import { generateAndStoreInvoicePdf, closePdfBrowser } from "./lib/invoice-pdf.js";

const app = new Hono<AuthEnv>();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",");

app.use(
  // "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/v1/me", requireAuth, (c) => c.json(c.get("user")));

app.post("/v1/bookings", requireAuth, async (c) => {
  const parsed = createBookingSchema.safeParse(await c.req.json());

  if (!parsed.success) {
    return c.json({ error: "Invalid booking payload", issues: parsed.error.issues }, 400);
  }

  const booking = await createBooking(c.get("user"), parsed.data);
  return c.json(booking, 201);
});

app.get("/v1/bookings", requireAuth, async (c) => {
  const bookings = await listBookings(c.get("user"));
  return c.json(bookings);
});

app.patch("/v1/bookings/:id", requireAuth, async (c) => {
  const parsed = modifyBookingSchema.safeParse(await c.req.json());

  if (!parsed.success) {
    return c.json({ error: "Invalid booking modification payload", issues: parsed.error.issues }, 400);
  }

  try {
    const booking = await modifyBooking(c.get("user"), c.req.param("id")!, parsed.data);
    return c.json(booking);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Unable to modify booking" }, 400);
  }
});

app.get("/v1/services", async (c) => {
  const services = await prisma.service.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: [{ title: "asc" }],
  });
  return c.json(services);
});

app.get("/v1/invoices", requireAuth, async (c) => {
  const invoices = await prisma.invoice.findMany({
    where: { userId: c.get("user").id },
    include: { booking: { select: { code: true, scheduledAt: true } } },
    orderBy: { issuedAt: "desc" },
  });
  return c.json(invoices);
});

app.get("/v1/invoices/:number/pdf", requireAuth, async (c) => {
  const user = c.get("user");
  const number = c.req.param("number");

  const invoice = await prisma.invoice.findUnique({ where: { number } });

  if (!invoice || (invoice.userId !== user.id && user.role !== UserRole.ADMIN)) {
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

app.post("/v1/payments/orders", requireAuth, async (c) => {
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

app.post("/v1/payments/verify", requireAuth, async (c) => {
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

app.post("/v1/payments/webhook", async (c) => {
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

const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, (info) => {
  logger.info(`api listening on http://localhost:${info.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await closePdfBrowser();
    process.exit(0);
  });
}
