import { prisma, type Service } from "@repo/database";
import type { CreateServiceInput, UpdateServiceInput } from "@repo/validation";

export async function listServicesForAdmin(): Promise<Service[]> {
  return prisma.service.findMany({
    include: { category: true },
    orderBy: [{ title: "asc" }],
  });
}

export async function createService(input: CreateServiceInput): Promise<Service> {
  return prisma.service.create({ data: input });
}

export async function updateService(id: string, input: UpdateServiceInput): Promise<Service> {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Service not found");
  }
  return prisma.service.update({ where: { id }, data: input });
}

export async function deleteService(id: string): Promise<void> {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Service not found");
  }
  await prisma.service.delete({ where: { id } });
}
