import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "@repo/logger";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

const port = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port }, (info) => {
  logger.info(`api listening on http://localhost:${info.port}`);
});
