import { Hono } from "hono";
import { requireAuth, type AuthEnv } from "../common/auth.js";
import { listNotifications, markNotificationRead, markAllNotificationsRead } from "./notifications.js";

export const notificationsRoutes = new Hono<AuthEnv>();

notificationsRoutes.get("/v1/notifications", requireAuth, async (c) => {
  const result = await listNotifications(c.get("user"));
  return c.json(result);
});

notificationsRoutes.patch("/v1/notifications/read-all", requireAuth, async (c) => {
  const result = await markAllNotificationsRead(c.get("user"));
  return c.json(result);
});

notificationsRoutes.patch("/v1/notifications/:id/read", requireAuth, async (c) => {
  try {
    const notification = await markNotificationRead(c.get("user"), c.req.param("id")!);
    return c.json(notification);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Unable to update notification" }, 400);
  }
});
