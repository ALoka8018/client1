import { Hono } from "hono";
import { UserRole } from "@repo/database";
import { createBookingSchema, modifyBookingSchema, assignTechnicianSchema } from "@repo/validation";
import { requireAuth, requireRole, ADMIN_ROLES, isAdminRole, type AuthEnv } from "../common/auth.js";
import { rateLimit } from "../common/rateLimit.js";
import { createBooking, listBookings, modifyBooking } from "./bookings.js";
import {
  uploadBookingAttachment,
  listAllBookingsForAdmin,
  listBookingAttachmentsForAdmin,
  getProjectGallery,
} from "./attachments.js";
import { isBookingAssignedToTechnician, assignTechnicianToBooking } from "../technicians/technician.js";

export const bookingsRoutes = new Hono<AuthEnv>();

bookingsRoutes.post(
  "/v1/bookings",
  requireAuth,
  rateLimit({ windowMs: 5 * 60 * 1000, max: 10 }),
  async (c) => {
    const parsed = createBookingSchema.safeParse(await c.req.json());

    if (!parsed.success) {
      return c.json({ error: "Invalid booking payload", issues: parsed.error.issues }, 400);
    }

    const booking = await createBooking(c.get("user"), parsed.data);
    return c.json(booking, 201);
  },
);

bookingsRoutes.get("/v1/bookings", requireAuth, async (c) => {
  const bookings = await listBookings(c.get("user"));
  return c.json(bookings);
});

bookingsRoutes.patch("/v1/bookings/:id", requireAuth, async (c) => {
  const parsed = modifyBookingSchema.safeParse(await c.req.json());

  if (!parsed.success) {
    return c.json({ error: "Invalid booking modification payload", issues: parsed.error.issues }, 400);
  }

  try {
    const booking = await modifyBooking(c.get("user"), c.req.param("id")!, parsed.data);
    return c.json(booking);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Unable to modify booking" }, 400);
  }
});

bookingsRoutes.post(
  "/v1/bookings/:id/attachments",
  requireAuth,
  requireRole(...ADMIN_ROLES, UserRole.TECHNICIAN),
  async (c) => {
    const user = c.get("user");
    const bookingId = c.req.param("id")!;

    if (user.role === UserRole.TECHNICIAN) {
      const assigned = await isBookingAssignedToTechnician(user, bookingId);
      if (!assigned) {
        return c.json({ error: "This job is not assigned to you" }, 403);
      }
    }

    const body = await c.req.parseBody();
    const file = body.file;

    if (!(file instanceof File)) {
      return c.json({ error: "A file is required" }, 400);
    }

    const photoType = typeof body.photoType === "string" ? body.photoType : undefined;
    if (photoType && photoType !== "BEFORE" && photoType !== "AFTER") {
      return c.json({ error: "photoType must be BEFORE or AFTER" }, 400);
    }

    // Technicians can document a job, but only staff can approve a photo for public featuring.
    const isAdmin = isAdminRole(user.role);

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const attachment = await uploadBookingAttachment({
        bookingId,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        data: buffer,
        photoType: photoType as "BEFORE" | "AFTER" | undefined,
        featured: isAdmin && body.featured === "true",
        consent: isAdmin && body.consent === "true",
      });
      return c.json(attachment, 201);
    } catch (err) {
      return c.json(
        { error: err instanceof Error ? err.message : "Unable to upload attachment" },
        400,
      );
    }
  },
);

bookingsRoutes.get("/v1/admin/bookings", requireAuth, requireRole(...ADMIN_ROLES), async (c) => {
  const bookings = await listAllBookingsForAdmin();
  return c.json(bookings);
});

bookingsRoutes.get(
  "/v1/admin/bookings/:id/attachments",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  async (c) => {
    const attachments = await listBookingAttachmentsForAdmin(c.req.param("id")!);
    return c.json(attachments);
  },
);

bookingsRoutes.patch(
  "/v1/admin/bookings/:id/assign",
  requireAuth,
  requireRole(...ADMIN_ROLES),
  async (c) => {
    const parsed = assignTechnicianSchema.safeParse(await c.req.json());

    if (!parsed.success) {
      return c.json({ error: "Invalid assignment payload", issues: parsed.error.issues }, 400);
    }

    try {
      const booking = await assignTechnicianToBooking(
        c.req.param("id")!,
        parsed.data.technicianUserId,
      );
      return c.json(booking);
    } catch (err) {
      return c.json({ error: err instanceof Error ? err.message : "Unable to assign technician" }, 400);
    }
  },
);

bookingsRoutes.get("/v1/projects/gallery", async (c) => {
  const gallery = await getProjectGallery();
  return c.json(gallery);
});
