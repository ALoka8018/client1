import { Hono } from "hono";
import { createSupportTicketSchema } from "@repo/validation";
import { requireAuth, type AuthEnv } from "../common/auth.js";
import { rateLimit } from "../common/rateLimit.js";
import { createSupportTicket, listSupportTickets } from "./support.js";

export const supportRoutes = new Hono<AuthEnv>();

supportRoutes.post(
  "/v1/support-tickets",
  requireAuth,
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  async (c) => {
    const parsed = createSupportTicketSchema.safeParse(await c.req.json());

    if (!parsed.success) {
      return c.json({ error: "Invalid support ticket payload", issues: parsed.error.issues }, 400);
    }

    const ticket = await createSupportTicket(c.get("user"), parsed.data);
    return c.json(ticket, 201);
  },
);

supportRoutes.get("/v1/support-tickets", requireAuth, async (c) => {
  const tickets = await listSupportTickets(c.get("user"));
  return c.json(tickets);
});
