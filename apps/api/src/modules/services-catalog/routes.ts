import { Hono } from "hono";
import { prisma } from "@repo/database";
import { createServiceSchema, updateServiceSchema, createLeadSchema } from "@repo/validation";
import { requireAuth, requireRole, ADMIN_ROLES, type AuthEnv } from "../common/auth.js";
import { rateLimit } from "../common/rateLimit.js";
import { serviceReviewAggregates } from "../reviews/reviews.js";
import { listServicesForAdmin, createService, updateService, deleteService } from "./services.js";
import { checkServiceAreaByPincode, createLead } from "./serviceAreas.js";

export const servicesCatalogRoutes = new Hono<AuthEnv>();

servicesCatalogRoutes.get("/v1/service-areas/check", async (c) => {
  const pincode = c.req.query("pincode");

  if (!pincode) {
    return c.json({ error: "pincode query param is required" }, 400);
  }

  const result = await checkServiceAreaByPincode(pincode);
  return c.json(result);
});

servicesCatalogRoutes.post("/v1/leads", rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }), async (c) => {
  const parsed = createLeadSchema.safeParse(await c.req.json());

  if (!parsed.success) {
    return c.json({ error: "Invalid lead payload", issues: parsed.error.issues }, 400);
  }

  const lead = await createLead(parsed.data);
  return c.json(lead, 201);
});

servicesCatalogRoutes.get("/v1/services", async (c) => {
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

servicesCatalogRoutes.get("/v1/admin/services", requireAuth, requireRole(...ADMIN_ROLES), async (c) => {
  const services = await listServicesForAdmin();
  return c.json(services);
});

servicesCatalogRoutes.post("/v1/admin/services", requireAuth, requireRole(...ADMIN_ROLES), async (c) => {
  const parsed = createServiceSchema.safeParse(await c.req.json());

  if (!parsed.success) {
    return c.json({ error: "Invalid service payload", issues: parsed.error.issues }, 400);
  }

  const service = await createService(parsed.data);
  return c.json(service, 201);
});

servicesCatalogRoutes.patch(
  "/v1/admin/services/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  async (c) => {
    const parsed = updateServiceSchema.safeParse(await c.req.json());

    if (!parsed.success) {
      return c.json({ error: "Invalid service payload", issues: parsed.error.issues }, 400);
    }

    try {
      const service = await updateService(c.req.param("id")!, parsed.data);
      return c.json(service);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : "Unable to update service" }, 404);
    }
  },
);

servicesCatalogRoutes.delete(
  "/v1/admin/services/:id",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  async (c) => {
    try {
      await deleteService(c.req.param("id")!);
      return c.json({ success: true });
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : "Unable to delete service" }, 404);
    }
  },
);
