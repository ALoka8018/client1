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
  createReviewSchema,
  createSupportTicketSchema,
} from "@repo/validation";
import { createStorageDriver } from "@repo/storage";
import { requireAuth, requireRole, type AuthEnv } from "./middleware/auth.js";
import { createBooking, listBookings, modifyBooking } from "./lib/bookings.js";
import {
  createPaymentOrder,
  verifyPayment,
  verifyWebhookSignature,
  processRazorpayWebhook,
} from "./lib/payments.js";
import { generateAndStoreInvoicePdf, closePdfBrowser } from "./lib/invoice-pdf.js";
import { createReview, listReviews, serviceReviewAggregates } from "./lib/reviews.js";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./lib/notifications.js";
import { listDocuments } from "./lib/documents.js";
import { listProperties, getPropertyHealth } from "./lib/properties.js";
import { createSupportTicket, listSupportTickets } from "./lib/support.js";
import {
  uploadBookingAttachment,
  listAllBookingsForAdmin,
  listBookingAttachmentsForAdmin,
  getProjectGallery,
} from "./lib/attachments.js";

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

  const aggregates = await serviceReviewAggregates();

  const withReviewStats = services.map((service) => {
    const stats = aggregates.get(service.id);
    return {
      ...service,
      reviewCount: stats?.count ?? 0,
      // Fall back to the curated seed rating until a service has real reviews.
      averageRating: stats ? stats.average : Number(service.rating),
    };
  });

  return c.json(withReviewStats);
});

app.post("/v1/reviews", requireAuth, async (c) => {
  const parsed = createReviewSchema.safeParse(await c.req.json());

  if (!parsed.success) {
    return c.json({ error: "Invalid review payload", issues: parsed.error.issues }, 400);
  }

  try {
    const review = await createReview(c.get("user"), parsed.data);
    return c.json(review, 201);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Unable to submit review" }, 400);
  }
});

app.get("/v1/reviews", async (c) => {
  const serviceId = c.req.query("serviceId");
  const result = await listReviews(serviceId);
  return c.json(result);
});

app.get("/v1/notifications", requireAuth, async (c) => {
  const result = await listNotifications(c.get("user"));
  return c.json(result);
});

app.patch("/v1/notifications/read-all", requireAuth, async (c) => {
  const result = await markAllNotificationsRead(c.get("user"));
  return c.json(result);
});

app.patch("/v1/notifications/:id/read", requireAuth, async (c) => {
  try {
    const notification = await markNotificationRead(c.get("user"), c.req.param("id")!);
    return c.json(notification);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Unable to update notification" }, 400);
  }
});

app.get("/v1/documents", requireAuth, async (c) => {
  const result = await listDocuments(c.get("user"));
  return c.json(result);
});

app.get("/v1/properties", requireAuth, async (c) => {
  const properties = await listProperties(c.get("user"));
  return c.json(properties);
});

app.get("/v1/properties/:id/health", requireAuth, async (c) => {
  try {
    const metrics = await getPropertyHealth(c.get("user"), c.req.param("id")!);
    return c.json(metrics);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Unable to load property health" }, 404);
  }
});

app.post("/v1/support-tickets", requireAuth, async (c) => {
  const parsed = createSupportTicketSchema.safeParse(await c.req.json());

  if (!parsed.success) {
    return c.json({ error: "Invalid support ticket payload", issues: parsed.error.issues }, 400);
  }

  const ticket = await createSupportTicket(c.get("user"), parsed.data);
  return c.json(ticket, 201);
});

app.get("/v1/support-tickets", requireAuth, async (c) => {
  const tickets = await listSupportTickets(c.get("user"));
  return c.json(tickets);
});

app.post(
  "/v1/bookings/:id/attachments",
  requireAuth,
  requireRole(UserRole.ADMIN),
  async (c) => {
    const body = await c.req.parseBody();
    const file = body.file;

    if (!(file instanceof File)) {
      return c.json({ error: "A file is required" }, 400);
    }

    const photoType = typeof body.photoType === "string" ? body.photoType : undefined;
    if (photoType && photoType !== "BEFORE" && photoType !== "AFTER") {
      return c.json({ error: "photoType must be BEFORE or AFTER" }, 400);
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const attachment = await uploadBookingAttachment({
        bookingId: c.req.param("id")!,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        data: buffer,
        photoType: photoType as "BEFORE" | "AFTER" | undefined,
        featured: body.featured === "true",
        consent: body.consent === "true",
      });
      return c.json(attachment, 201);
    } catch (err) {
      return c.json(
        { error: err instanceof Error ? err.message : "Unable to upload attachment" },
        400,
      );
    }
  },
);

app.get("/v1/admin/bookings", requireAuth, requireRole(UserRole.ADMIN), async (c) => {
  const bookings = await listAllBookingsForAdmin();
  return c.json(bookings);
});

app.get(
  "/v1/admin/bookings/:id/attachments",
  requireAuth,
  requireRole(UserRole.ADMIN),
  async (c) => {
    const attachments = await listBookingAttachmentsForAdmin(c.req.param("id")!);
    return c.json(attachments);
  },
);

app.get("/v1/projects/gallery", async (c) => {
  const gallery = await getProjectGallery();
  return c.json(gallery);
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
