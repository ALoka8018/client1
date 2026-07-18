import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "@repo/logger";
import { prisma } from "@repo/database";
import { createBookingSchema, createPaymentOrderSchema, verifyPaymentSchema } from "@repo/validation";
import { requireAuth, type AuthEnv } from "./middleware/auth.js";
import { createBooking } from "./lib/bookings.js";
import { createPaymentOrder, verifyPayment } from "./lib/payments.js";

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

const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, (info) => {
  logger.info(`api listening on http://localhost:${info.port}`);
});
