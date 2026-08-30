import { Hono } from "hono";
import { requireAuth, type AuthEnv } from "../common/auth.js";
import { listDocuments } from "./documents.js";
import { listProperties, getPropertyHealth } from "./properties.js";

export const customersRoutes = new Hono<AuthEnv>();

customersRoutes.get("/v1/documents", requireAuth, async (c) => {
  const result = await listDocuments(c.get("user"));
  return c.json(result);
});

customersRoutes.get("/v1/properties", requireAuth, async (c) => {
  const properties = await listProperties(c.get("user"));
  return c.json(properties);
});

customersRoutes.get("/v1/properties/:id/health", requireAuth, async (c) => {
  try {
    const metrics = await getPropertyHealth(c.get("user"), c.req.param("id")!);
    return c.json(metrics);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Unable to load property health" }, 404);
  }
});
