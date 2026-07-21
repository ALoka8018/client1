import "dotenv/config";
import { prisma } from "@repo/database";
import { listProperties, getPropertyHealth } from "../src/lib/properties.ts";

const suffix = Math.random().toString(36).slice(2, 8);

const user = await prisma.user.create({
  data: {
    supabaseId: `test-prop-${suffix}`,
    email: `test-prop-${suffix}@example.com`,
    name: "Test Properties Customer",
  },
});
const otherUser = await prisma.user.create({
  data: {
    supabaseId: `test-prop-other-${suffix}`,
    email: `test-prop-other-${suffix}@example.com`,
    name: "Other Customer",
  },
});

try {
  const primary = await prisma.property.create({
    data: { userId: user.id, label: "Home", addressLine: "12 Test Lane", city: "Bhubaneswar", isPrimary: true },
  });
  const secondary = await prisma.property.create({
    data: { userId: user.id, label: "Office", addressLine: "45 Work Ave", city: "Cuttack", isPrimary: false },
  });
  const otherProperty = await prisma.property.create({
    data: { userId: otherUser.id, label: "Other Home", addressLine: "1 Elsewhere St", city: "Puri", isPrimary: true },
  });

  const listed = await listProperties(user);
  console.log("listProperties count:", listed.length === 2);
  console.log("Primary listed first:", listed[0].id === primary.id);

  const emptyHealth = await getPropertyHealth(user, primary.id);
  console.log("Empty health metrics (nothing populates this table):", emptyHealth.length === 0);

  await prisma.propertyHealthMetric.createMany({
    data: [
      { propertyId: primary.id, system: "ELECTRICAL", status: "OPTIMAL", healthPercent: 92 },
      { propertyId: primary.id, system: "PLUMBING", status: "NEEDS_ATTENTION", healthPercent: 58 },
    ],
  });

  const withMetrics = await getPropertyHealth(user, primary.id);
  console.log("Health metrics returned:", withMetrics.length === 2);
  console.log(
    "Ordered by system asc:",
    withMetrics[0].system === "ELECTRICAL" && withMetrics[1].system === "PLUMBING",
  );

  let rejectedCrossUser = false;
  try {
    await getPropertyHealth(user, otherProperty.id);
  } catch (err) {
    rejectedCrossUser = true;
    console.log("Cross-user property access rejected:", err.message);
  }
  console.log("Rejected cross-user access:", rejectedCrossUser);
} finally {
  await prisma.propertyHealthMetric.deleteMany({ where: { property: { userId: { in: [user.id, otherUser.id] } } } });
  await prisma.property.deleteMany({ where: { userId: { in: [user.id, otherUser.id] } } });
  await prisma.user.deleteMany({ where: { id: { in: [user.id, otherUser.id] } } });
  console.log("Cleaned up test data");
  await prisma.$disconnect();
}
