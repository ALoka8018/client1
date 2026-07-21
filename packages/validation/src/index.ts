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
  serviceId: z.string().min(1).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const createPaymentOrderSchema = z.object({
  invoiceId: z.string().min(1),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export const modifyBookingSchema = z
  .object({
    action: z.enum(["reschedule", "cancel"]),
    newDate: z.coerce.date().optional(),
    reason: z.string().min(1).optional(),
  })
  .refine((data) => data.action !== "reschedule" || data.newDate, {
    message: "newDate is required to reschedule a booking",
    path: ["newDate"],
  });

export type ModifyBookingInput = z.infer<typeof modifyBookingSchema>;

export const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(1),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const createSupportTicketSchema = z.object({
  topic: z.string().min(1),
  message: z.string().min(1),
});

export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
