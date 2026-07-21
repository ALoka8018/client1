import "dotenv/config";
import { prisma, BookingStatus, UserRole } from "@repo/database";
import {
  getOrCreateTechnicianProfile,
  assignTechnicianToBooking,
  getTechnicianRating,
  listTechnicianUsers,
} from "../src/lib/technician.ts";
import { createReview } from "../src/lib/reviews.ts";

const suffix = Math.random().toString(36).slice(2, 8);

const category = await prisma.serviceCategory.create({
  data: { key: `test-rating-${suffix}`, label: `Test Rating ${suffix}` },
});
const service = await prisma.service.create({
  data: {
    categoryId: category.id,
    title: "Leak Detection & Repair",
    description: "Diagnostic leak detection with repair.",
    priceLabel: "Starting at ₹1,999",
    priceAmount: 1999,
  },
});
const customer = await prisma.user.create({
  data: {
    supabaseId: `test-rating-customer-${suffix}`,
    email: `test-rating-customer-${suffix}@example.com`,
    name: "Test Customer",
  },
});
const technicianUser = await prisma.user.create({
  data: {
    supabaseId: `test-rating-tech-${suffix}`,
    email: `test-rating-tech-${suffix}@example.com`,
    name: "Test Rated Technician",
    role: UserRole.TECHNICIAN,
  },
});
const unratedTechnicianUser = await prisma.user.create({
  data: {
    supabaseId: `test-rating-unrated-${suffix}`,
    email: `test-rating-unrated-${suffix}@example.com`,
    name: "Unrated Technician",
    role: UserRole.TECHNICIAN,
  },
});
const property = await prisma.property.create({
  data: { userId: customer.id, label: "Home", addressLine: "12 Test Lane", city: "Bhubaneswar", isPrimary: true },
});

try {
  // Set a seed rating for the unrated technician to confirm fallback behavior.
  const unratedProfile = await getOrCreateTechnicianProfile(unratedTechnicianUser);
  await prisma.technicianProfile.update({ where: { id: unratedProfile.id }, data: { rating: 4.2 } });

  const noReviewsRating = await getTechnicianRating(unratedTechnicianUser.id);
  console.log(
    "Falls back to seed rating with zero reviews:",
    noReviewsRating.average === 4.2 && noReviewsRating.count === 0,
  );

  async function makeCompletedReviewedBooking(rating) {
    const booking = await prisma.booking.create({
      data: {
        code: `BK-RATING-${suffix}-${rating}`,
        userId: customer.id,
        propertyId: property.id,
        serviceId: service.id,
        status: BookingStatus.REQUESTED,
        scheduledAt: new Date(),
        problemDescription: "Test problem.",
      },
    });
    await assignTechnicianToBooking(booking.id, technicianUser.id);
    await prisma.booking.update({ where: { id: booking.id }, data: { status: BookingStatus.COMPLETED } });
    await createReview(customer, { bookingId: booking.id, rating, body: `Review for rating ${rating}` });
    return booking;
  }

  await makeCompletedReviewedBooking(5);
  await makeCompletedReviewedBooking(3);

  const rating = await getTechnicianRating(technicianUser.id);
  console.log("Average of 5 and 3 is 4:", rating.average === 4);
  console.log("Count is 2:", rating.count === 2);

  const technicianList = await listTechnicianUsers();
  const rated = technicianList.find((t) => t.id === technicianUser.id);
  const unrated = technicianList.find((t) => t.id === unratedTechnicianUser.id);
  console.log("listTechnicianUsers includes rating for rated technician:", rated?.rating === 4 && rated?.ratingCount === 2);
  console.log("listTechnicianUsers falls back to seed for unrated technician:", unrated?.rating === 4.2 && unrated?.ratingCount === 0);

  let rejectedNonTechnician = false;
  try {
    await getTechnicianRating(customer.id);
  } catch (err) {
    rejectedNonTechnician = true;
    console.log("Rejects rating lookup for non-technician:", err.message);
  }
  console.log("Rejected non-technician rating lookup:", rejectedNonTechnician);
} finally {
  await prisma.notification.deleteMany({ where: { userId: customer.id } });
  await prisma.review.deleteMany({ where: { userId: customer.id } });
  await prisma.bookingStatusEvent.deleteMany({ where: { booking: { userId: customer.id } } });
  await prisma.booking.deleteMany({ where: { userId: customer.id } });
  await prisma.property.deleteMany({ where: { userId: customer.id } });
  await prisma.technicianProfile.deleteMany({
    where: { userId: { in: [technicianUser.id, unratedTechnicianUser.id] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [customer.id, technicianUser.id, unratedTechnicianUser.id] } },
  });
  await prisma.service.delete({ where: { id: service.id } });
  await prisma.serviceCategory.delete({ where: { id: category.id } });
  console.log("Cleaned up test data");
  await prisma.$disconnect();
}
