import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "@repo/logger";
import { requireAuth, type AuthEnv } from "./modules/common/auth.js";
import { openApiSpec } from "./modules/common/openapi.js";
import { closePdfBrowser } from "./modules/payments/invoice-pdf.js";
import { bookingsRoutes } from "./modules/bookings/routes.js";
import { paymentsRoutes } from "./modules/payments/routes.js";
import { reviewsRoutes } from "./modules/reviews/routes.js";
import { servicesCatalogRoutes } from "./modules/services-catalog/routes.js";
import { techniciansRoutes } from "./modules/technicians/routes.js";
import { staffAdminRoutes } from "./modules/staff-admin/routes.js";
import { notificationsRoutes } from "./modules/notifications/routes.js";
import { customersRoutes } from "./modules/customers/routes.js";
import { supportRoutes } from "./modules/support/routes.js";

const app = new Hono<AuthEnv>();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",");

app.use(secureHeaders());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.onError((err, c) => {
  logger.error(
    `Unhandled error on ${c.req.method} ${c.req.path}: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
  );
  const isProd = process.env.NODE_ENV === "production";
  return c.json(
    { error: isProd ? "Internal server error" : (err instanceof Error ? err.message : "Internal server error") },
    500,
  );
});

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/openapi.json", (c) => c.json(openApiSpec));

app.get("/docs", (c) =>
  c.html(`<!doctype html>
<html>
  <head>
    <title>API Docs — Seepage Doctor</title>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({ url: "/openapi.json", dom_id: "#swagger-ui" });
    </script>
  </body>
</html>`),
);

app.get("/v1/me", requireAuth, (c) => c.json(c.get("user")));

app
  .route("/", bookingsRoutes)
  .route("/", paymentsRoutes)
  .route("/", reviewsRoutes)
  .route("/", servicesCatalogRoutes)
  .route("/", techniciansRoutes)
  .route("/", staffAdminRoutes)
  .route("/", notificationsRoutes)
  .route("/", customersRoutes)
  .route("/", supportRoutes);

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
