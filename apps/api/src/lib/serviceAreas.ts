import { prisma, type Lead } from "@repo/database";
import type { CreateLeadInput } from "@repo/validation";

export interface ServiceAreaCheckResult {
  available: boolean;
  city?: string;
  area?: string;
}

export async function checkServiceAreaByPincode(pincode: string): Promise<ServiceAreaCheckResult> {
  const match = await prisma.serviceArea.findFirst({ where: { pincode, active: true } });

  if (!match) {
    return { available: false };
  }

  return { available: true, city: match.city, area: match.area ?? undefined };
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  return prisma.lead.create({ data: input });
}
