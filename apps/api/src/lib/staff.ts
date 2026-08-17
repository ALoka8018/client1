import { prisma, UserRole, type User } from "@repo/database";
import type { AdminUpdateUserInput } from "@repo/validation";

export interface StaffUserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  technicianActive: boolean | null;
}

export interface ListUsersFilter {
  role?: UserRole;
  q?: string;
}

function toRow(
  user: User & { technicianProfile: { active: boolean } | null },
): StaffUserRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    technicianActive: user.technicianProfile?.active ?? null,
  };
}

export async function listUsers(filter: ListUsersFilter): Promise<StaffUserRow[]> {
  const users = await prisma.user.findMany({
    where: {
      role: filter.role,
      ...(filter.q
        ? {
            OR: [
              { name: { contains: filter.q, mode: "insensitive" } },
              { email: { contains: filter.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { technicianProfile: { select: { active: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return users.map(toRow);
}

export async function updateUserAsAdmin(
  actorId: string,
  targetId: string,
  input: AdminUpdateUserInput,
): Promise<StaffUserRow> {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    include: { technicianProfile: true },
  });

  if (!target) {
    throw new Error("User not found");
  }

  if (input.role && targetId === actorId) {
    throw new Error("Cannot change your own role");
  }

  if (input.role && input.role !== UserRole.SUPER_ADMIN && target.role === UserRole.SUPER_ADMIN) {
    const otherSuperAdmins = await prisma.user.count({
      where: { role: UserRole.SUPER_ADMIN, id: { not: targetId } },
    });
    if (otherSuperAdmins === 0) {
      throw new Error("Cannot demote the last remaining super admin");
    }
  }

  if (input.technicianActive !== undefined && !target.technicianProfile) {
    throw new Error("User has no technician profile");
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (input.role === UserRole.TECHNICIAN && !target.technicianProfile) {
      await tx.technicianProfile.create({ data: { userId: targetId } });
    }

    if (
      input.role &&
      input.role !== UserRole.TECHNICIAN &&
      target.role === UserRole.TECHNICIAN &&
      target.technicianProfile
    ) {
      await tx.technicianProfile.update({
        where: { userId: targetId },
        data: { active: false },
      });
    }

    if (input.technicianActive !== undefined) {
      await tx.technicianProfile.update({
        where: { userId: targetId },
        data: { active: input.technicianActive },
      });
    }

    return tx.user.update({
      where: { id: targetId },
      data: {
        role: input.role,
        name: input.name,
        phone: input.phone,
      },
      include: { technicianProfile: { select: { active: true } } },
    });
  });

  return toRow(updated);
}
