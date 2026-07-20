import { prisma, BookingStatus, type Review, type User } from "@repo/database";
import type { CreateReviewInput } from "@repo/validation";

export async function createReview(user: User, input: CreateReviewInput): Promise<Review> {
  const booking = await prisma.booking.findFirst({
    where: { id: input.bookingId, userId: user.id },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error("Reviews can only be submitted for completed bookings");
  }

  const existing = await prisma.review.findUnique({ where: { bookingId: booking.id } });
  if (existing) {
    throw new Error("A review has already been submitted for this booking");
  }

  return prisma.review.create({
    data: {
      bookingId: booking.id,
      userId: user.id,
      serviceId: booking.serviceId,
      rating: input.rating,
      body: input.body,
      verified: true,
    },
  });
}

export type ReviewListItem = Review & { user: { name: string } };

export async function listReviews(
  serviceId?: string,
): Promise<{ reviews: ReviewListItem[]; average: number | null; count: number }> {
  const reviews = await prisma.review.findMany({
    where: serviceId ? { serviceId } : undefined,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : null;

  return { reviews, average, count };
}

export async function serviceReviewAggregates(): Promise<
  Map<string, { average: number; count: number }>
> {
  const grouped = await prisma.review.groupBy({
    by: ["serviceId"],
    where: { serviceId: { not: null } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const map = new Map<string, { average: number; count: number }>();
  for (const row of grouped) {
    if (!row.serviceId) continue;
    map.set(row.serviceId, { average: row._avg.rating ?? 0, count: row._count.rating });
  }
  return map;
}
