import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "@repo/logger";
import { createBookingSchema } from "@repo/validation";
import { requireAuth, type AuthEnv } from "./middleware/auth.js";
import { createBooking } from "./lib/bookings.js";

const app = new Hono<AuthEnv>();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",");

app.use(
  "*",
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

const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, (info) => {
  logger.info(`api listening on http://localhost:${info.port}`);
});
