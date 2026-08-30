import { Hono } from "hono";
import { UserRole } from "@repo/database";
import { adminUpdateUserSchema } from "@repo/validation";
import { requireAuth, requireRole, ADMIN_ROLES, type AuthEnv } from "../common/auth.js";
import { getAdminDashboard } from "./dashboard.js";
import { listUsers, updateUserAsAdmin } from "./staff.js";

export const staffAdminRoutes = new Hono<AuthEnv>();

staffAdminRoutes.get("/v1/admin/dashboard", requireAuth, requireRole(...ADMIN_ROLES), async (c) => {
  const dashboard = await getAdminDashboard();
  return c.json(dashboard);
});

staffAdminRoutes.get("/v1/admin/users", requireAuth, requireRole(UserRole.SUPER_ADMIN), async (c) => {
  const role = c.req.query("role");
  const q = c.req.query("q");
  const users = await listUsers({ role: role ? (role as UserRole) : undefined, q });
  return c.json(users);
});

staffAdminRoutes.patch(
  "/v1/admin/users/:id",
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  async (c) => {
    const parsed = adminUpdateUserSchema.safeParse(await c.req.json());

    if (!parsed.success) {
      return c.json({ error: "Invalid user update payload", issues: parsed.error.issues }, 400);
    }

    try {
      const user = await updateUserAsAdmin(c.get("user").id, c.req.param("id")!, parsed.data);
      return c.json(user);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : "Unable to update user" }, 400);
    }
  },
);
