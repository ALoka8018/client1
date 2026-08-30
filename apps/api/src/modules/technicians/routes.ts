import { Hono } from "hono";
import { UserRole, type TechnicianApplicationStatus } from "@repo/database";
import {
  updateTechnicianJobStatusSchema,
  createTechnicianApplicationSchema,
  reviewTechnicianApplicationSchema,
} from "@repo/validation";
import { requireAuth, requireRole, ADMIN_ROLES, type AuthEnv } from "../common/auth.js";
import { rateLimit } from "../common/rateLimit.js";
import {
  listTechnicianJobs,
  updateTechnicianJobStatus,
  listTechnicianUsers,
  getTechnicianRating,
} from "./technician.js";
import {
  createTechnicianApplication,
  listTechnicianApplications,
  reviewTechnicianApplication,
} from "./technician-applications.js";

export const techniciansRoutes = new Hono<AuthEnv>();

techniciansRoutes.get(
  "/v1/technician/jobs",
  requireAuth,
  requireRole(UserRole.TECHNICIAN),
  async (c) => {
    const jobs = await listTechnicianJobs(c.get("user"));
    return c.json(jobs);
  },
);

techniciansRoutes.patch(
  "/v1/technician/jobs/:id/status",
  requireAuth,
  requireRole(UserRole.TECHNICIAN),
  async (c) => {
    const parsed = updateTechnicianJobStatusSchema.safeParse(await c.req.json());

    if (!parsed.success) {
      return c.json({ error: "Invalid job status payload", issues: parsed.error.issues }, 400);
    }

    try {
      const job = await updateTechnicianJobStatus(c.get("user"), c.req.param("id")!, parsed.data);
      return c.json(job);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : "Unable to update job" }, 400);
    }
  },
);

techniciansRoutes.get("/v1/admin/technicians", requireAuth, requireRole(...ADMIN_ROLES), async (c) => {
  const technicians = await listTechnicianUsers();
  return c.json(technicians);
});

techniciansRoutes.get(
  "/v1/technicians/:id/rating",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  async (c) => {
    try {
      const rating = await getTechnicianRating(c.req.param("id")!);
      return c.json(rating);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : "Unable to load rating" }, 404);
    }
  },
);

techniciansRoutes.post(
  "/v1/technician-applications",
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  async (c) => {
    const parsed = createTechnicianApplicationSchema.safeParse(await c.req.json());

    if (!parsed.success) {
      return c.json(
        { error: "Invalid technician application payload", issues: parsed.error.issues },
        400,
      );
    }

    const application = await createTechnicianApplication(parsed.data);
    return c.json(application, 201);
  },
);

techniciansRoutes.get(
  "/v1/admin/technician-applications",
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  async (c) => {
    const status = c.req.query("status");
    const applications = await listTechnicianApplications(
      status ? (status as TechnicianApplicationStatus) : undefined,
    );
    return c.json(applications);
  },
);

techniciansRoutes.patch(
  "/v1/admin/technician-applications/:id",
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  async (c) => {
    const parsed = reviewTechnicianApplicationSchema.safeParse(await c.req.json());

    if (!parsed.success) {
      return c.json({ error: "Invalid review payload", issues: parsed.error.issues }, 400);
    }

    try {
      const application = await reviewTechnicianApplication(c.req.param("id")!, parsed.data);
      return c.json(application);
    } catch (err) {
      return c.json(
        { error: err instanceof Error ? err.message : "Unable to review application" },
        400,
      );
    }
  },
);
