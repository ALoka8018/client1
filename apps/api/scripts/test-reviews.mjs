import "dotenv/config";
import { prisma, BookingStatus } from "@repo/database";
import { createReview, listReviews, serviceReviewAggregates } from "../src/lib/reviews.ts";

const suffix = Math.random().toString(36).slice(2, 8);

const category = await prisma.serviceCategory.create({
  data: { key: `test-review-${suffix}`, label: `Test Review ${suffix}` },
});
const service = await prisma.service.create({
  data: {
    categoryId: category.id,
    title: "Leak Detection & Repair",
    description: "Diagnostic leak detection with repair.",
    priceLabel: "Starting at ₹1,999",
    priceAmount: 1999,
    rating: 4.5,
  },
});
const user = await prisma.user.create({
  data: {
    supabaseId: `test-review-${suffix}`,
    email: `test-review-${suffix}@example.com`,
    name: "Test Review Customer",
  },
});
const property = await prisma.property.create({
  data: { userId: user.id, label: "Home", addressLine: "12 Test Lane", city: "Bhubaneswar", isPrimary: true },
});

async function makeBooking(status, code) {
  const booking = await prisma.booking.create({
    data: {
      code,
      userId: user.id,
      propertyId: property.id,
      serviceId: service.id,
      status,
      scheduledAt: new Date(),
      problemDescription: "Test problem.",
    },
  });
  return booking;
}

try {
  const notCompleted = await makeBooking(BookingStatus.CONFIRMED, `BK-REVIEW-PENDING-${suffix}`);
  let rejectedNotCompleted = false;
  try {
    await createReview(user, { bookingId: notCompleted.id, rating: 5, body: "Great!" });
  } catch (err) {
    rejectedNotCompleted = true;
    console.log("Review on non-completed booking rejected:", err.message);
  }
  console.log("Rejected non-completed:", rejectedNotCompleted);

  const completed = await makeBooking(BookingStatus.COMPLETED, `BK-REVIEW-DONE-${suffix}`);
  const review = await createReview(user, {
    bookingId: completed.id,
    rating: 5,
    body: "Excellent, fast, and thorough work.",
  });
  console.log("Review created:", review.rating, review.verified, review.serviceId === service.id);

  let rejectedDuplicate = false;
  try {
    await createReview(user, { bookingId: completed.id, rating: 3, body: "Second attempt" });
  } catch (err) {
    rejectedDuplicate = true;
    console.log("Duplicate review rejected:", err.message);
  }
  console.log("Rejected duplicate:", rejectedDuplicate);

  const otherCompleted = await makeBooking(BookingStatus.COMPLETED, `BK-REVIEW-DONE2-${suffix}`);
  await createReview(user, { bookingId: otherCompleted.id, rating: 3, body: "Decent, could improve." });

  const listed = await listReviews(service.id);
  console.log("listReviews count:", listed.count, "average:", listed.average);

  const aggregates = await serviceReviewAggregates();
  const stats = aggregates.get(service.id);
  console.log("serviceReviewAggregates for this service:", stats);
} finally {
  await prisma.review.deleteMany({ where: { userId: user.id } });
  await prisma.booking.deleteMany({ where: { userId: user.id } });
  await prisma.property.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.service.delete({ where: { id: service.id } });
  await prisma.serviceCategory.delete({ where: { id: category.id } });
  console.log("Cleaned up test data");
  await prisma.$disconnect();
}
