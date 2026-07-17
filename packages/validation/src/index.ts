import { z } from "zod";

export const emailSchema = z.email();

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const createBookingSchema = z.object({
  propertyType: z.enum(["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "INFRASTRUCTURE"]),
  city: z.string().min(1),
  phone: z.string().min(1).optional(),
  scheduledAt: z.coerce.date(),
  problemDescription: z.string().min(1),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
