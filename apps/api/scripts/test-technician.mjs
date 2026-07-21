import "dotenv/config";
import { prisma, BookingStatus, UserRole } from "@repo/database";
import {
  getOrCreateTechnicianProfile,
  listTechnicianJobs,
  updateTechnicianJobStatus,
  isBookingAssignedToTechnician,
  listTechnicianUsers,
  assignTechnicianToBooking,
} from "../src/lib/technician.ts";

const suffix = Math.random().toString(36).slice(2, 8);

const category = await prisma.serviceCategory.create({
  data: { key: `test-tech-${suffix}`, label: `Test Tech ${suffix}` },
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
    supabaseId: `test-tech-customer-${suffix}`,
    email: `test-tech-customer-${suffix}@example.com`,
    name: "Test Customer",
  },
});
const technicianUser = await prisma.user.create({
  data: {
    supabaseId: `test-tech-${suffix}`,
    email: `test-tech-${suffix}@example.com`,
    name: "Test Technician",
    role: UserRole.TECHNICIAN,
  },
});
const otherTechnicianUser = await prisma.user.create({
  data: {
    supabaseId: `test-tech-other-${suffix}`,
    email: `test-tech-other-${suffix}@example.com`,
    name: "Other Technician",
    role: UserRole.TECHNICIAN,
  },
});
const property = await prisma.property.create({
  data: { userId: customer.id, label: "Home", addressLine: "12 Test Lane", city: "Bhubaneswar", isPrimary: true },
});
const booking = await prisma.booking.create({
  data: {
    code: `BK-TECH-${suffix}`,
    userId: customer.id,
    propertyId: property.id,
    serviceId: service.id,
    status: BookingStatus.REQUESTED,
    scheduledAt: new Date(),
    problemDescription: "Test problem.",
  },
});

try {
  const emptyJobs = await listTechnicianJobs(technicianUser);
  console.log("No jobs before assignment:", emptyJobs.length === 0);

  const assigned = await assignTechnicianToBooking(booking.id, technicianUser.id);
  console.log("Booking flips to ASSIGNED:", assigned.status === BookingStatus.ASSIGNED);

  let rejectedNonTechnician = false;
  try {
    await assignTechnicianToBooking(booking.id, customer.id);
  } catch (err) {
    rejectedNonTechnician = true;
    console.log("Rejects assigning a non-technician:", err.message);
  }
  console.log("Rejected non-technician assignment:", rejectedNonTechnician);

  const jobs = await listTechnicianJobs(technicianUser);
  console.log("Job appears in technician's list:", jobs.length === 1 && jobs[0].id === booking.id);

  const otherJobs = await listTechnicianJobs(otherTechnicianUser);
  console.log("Job does not appear for a different technician:", otherJobs.length === 0);

  console.log(
    "isBookingAssignedToTechnician true for assignee:",
    await isBookingAssignedToTechnician(technicianUser, booking.id),
  );
  console.log(
    "isBookingAssignedToTechnician false for other technician:",
    !(await isBookingAssignedToTechnician(otherTechnicianUser, booking.id)),
  );

  const enRoute = await updateTechnicianJobStatus(technicianUser, booking.id, { action: "en_route" });
  console.log("Status -> EN_ROUTE:", enRoute.status === BookingStatus.EN_ROUTE);

  const arrived = await updateTechnicianJobStatus(technicianUser, booking.id, {
    action: "arrived",
    note: "Arrived on site, starting diagnostics",
  });
  console.log("Status -> IN_PROGRESS:", arrived.status === BookingStatus.IN_PROGRESS);

  const completed = await updateTechnicianJobStatus(technicianUser, booking.id, { action: "completed" });
  console.log("Status -> COMPLETED:", completed.status === BookingStatus.COMPLETED);

  let rejectedOtherTechnician = false;
  try {
    await updateTechnicianJobStatus(otherTechnicianUser, booking.id, { action: "en_route" });
  } catch (err) {
    rejectedOtherTechnician = true;
    console.log("Other technician cannot update this job:", err.message);
  }
  console.log("Rejected cross-technician update:", rejectedOtherTechnician);

  const events = await prisma.bookingStatusEvent.findMany({ where: { bookingId: booking.id }, orderBy: { createdAt: "asc" } });
  console.log(
    "Status events recorded:",
    events.map((e) => e.status),
  );

  const notifications = await prisma.notification.findMany({ where: { userId: customer.id } });
  console.log(
    "Customer notified for each transition:",
    notifications.map((n) => n.type),
  );

  const technicianOptions = await listTechnicianUsers();
  console.log(
    "listTechnicianUsers includes both technicians:",
    technicianOptions.some((t) => t.id === technicianUser.id) &&
      technicianOptions.some((t) => t.id === otherTechnicianUser.id),
  );

  const profile = await getOrCreateTechnicianProfile(technicianUser);
  const profileAgain = await getOrCreateTechnicianProfile(technicianUser);
  console.log("getOrCreateTechnicianProfile idempotent:", profile.id === profileAgain.id);
} finally {
  await prisma.notification.deleteMany({ where: { userId: customer.id } });
  await prisma.bookingStatusEvent.deleteMany({ where: { bookingId: booking.id } });
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.property.deleteMany({ where: { userId: customer.id } });
  await prisma.technicianProfile.deleteMany({ where: { userId: { in: [technicianUser.id, otherTechnicianUser.id] } } });
  await prisma.user.deleteMany({ where: { id: { in: [customer.id, technicianUser.id, otherTechnicianUser.id] } } });
  await prisma.service.delete({ where: { id: service.id } });
  await prisma.serviceCategory.delete({ where: { id: category.id } });
  console.log("Cleaned up test data");
  await prisma.$disconnect();
}
