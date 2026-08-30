import { Hono } from "hono";
import { createReviewSchema, updateReviewStatusSchema } from "@repo/validation";
import { requireAuth, requireRole, ADMIN_ROLES, type AuthEnv } from "../common/auth.js";
import { rateLimit } from "../common/rateLimit.js";
import { createReview, listReviews, listReviewsForAdmin, updateReviewStatus } from "./reviews.js";

export const reviewsRoutes = new Hono<AuthEnv>();

reviewsRoutes.post(
  "/v1/reviews",
  requireAuth,
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  async (c) => {
    const parsed = createReviewSchema.safeParse(await c.req.json());

    if (!parsed.success) {
      return c.json({ error: "Invalid review payload", issues: parsed.error.issues }, 400);
    }

    try {
      const review = await createReview(c.get("user"), parsed.data);
      return c.json(review, 201);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : "Unable to submit review" }, 400);
    }
  },
);

reviewsRoutes.get("/v1/reviews", async (c) => {
  const serviceId = c.req.query("serviceId");
  const result = await listReviews(serviceId);
  return c.json(result);
});

reviewsRoutes.get("/v1/admin/reviews", requireAuth, requireRole(...ADMIN_ROLES), async (c) => {
  const reviews = await listReviewsForAdmin();
  return c.json(reviews);
});

reviewsRoutes.patch("/v1/admin/reviews/:id", requireAuth, requireRole(...ADMIN_ROLES), async (c) => {
  const parsed = updateReviewStatusSchema.safeParse(await c.req.json());

  if (!parsed.success) {
    return c.json({ error: "Invalid review status payload", issues: parsed.error.issues }, 400);
  }

  try {
    const review = await updateReviewStatus(c.req.param("id")!, parsed.data.status);
    return c.json(review);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Unable to update review" }, 404);
  }
});
