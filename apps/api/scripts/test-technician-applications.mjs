import "dotenv/config";
import { prisma } from "@repo/database";
import { createTechnicianApplication } from "../src/lib/technician-applications.ts";

const suffix = Math.random().toString(36).slice(2, 8);

const application = await createTechnicianApplication({
  name: "Test Applicant",
  email: `test-applicant-${suffix}@example.com`,
  phone: "+919876500000",
  city: "Bhubaneswar",
  experience: "5 years as a plumbing technician",
  certifications: "ITI Plumbing Certificate",
  availability: "Weekdays, full-time",
});

console.log("Application created:", application.status === "PENDING");
console.log("Fields stored correctly:", application.name === "Test Applicant" && application.city === "Bhubaneswar");

const fetched = await prisma.technicianApplication.findUnique({ where: { id: application.id } });
console.log("Persisted in DB:", fetched !== null);

await prisma.technicianApplication.delete({ where: { id: application.id } });
console.log("Cleaned up test data");
await prisma.$disconnect();
