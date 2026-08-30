import { prisma, type Property, type PropertyHealthMetric, type User } from "@repo/database";

export async function listProperties(user: User): Promise<Property[]> {
  return prisma.property.findMany({
    where: { userId: user.id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });
}

export async function getPropertyHealth(
  user: User,
  propertyId: string,
): Promise<PropertyHealthMetric[]> {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId: user.id },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  return prisma.propertyHealthMetric.findMany({
    where: { propertyId: property.id },
    orderBy: { system: "asc" },
  });
}
