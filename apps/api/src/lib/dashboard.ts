import { prisma, BookingStatus } from "@repo/database";

export interface AdminDashboard {
  todayBookingsCount: number;
  statusCounts: Record<string, number>;
  availableTechnicians: { id: string; name: string; email: string }[];
  latestReviews: {
    id: string;
    rating: number;
    body: string;
    userName: string;
    createdAt: Date;
  }[];
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [todayBookingsCount, statusGroups, availableTechnicians, latestReviews] =
    await Promise.all([
      prisma.booking.count({ where: { scheduledAt: { gte: startOfDay, lt: endOfDay } } }),
      prisma.booking.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.technicianProfile.findMany({
        where: { active: true },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.review.findMany({
        where: { status: "APPROVED" },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const statusCounts = Object.fromEntries(
    Object.values(BookingStatus).map((status) => [status, 0]),
  ) as Record<string, number>;
  for (const group of statusGroups) {
    statusCounts[group.status] = group._count.status;
  }

  return {
    todayBookingsCount,
    statusCounts,
    availableTechnicians: availableTechnicians.map((t) => ({
      id: t.user.id,
      name: t.user.name,
      email: t.user.email,
    })),
    latestReviews: latestReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      userName: r.user.name,
      createdAt: r.createdAt,
    })),
  };
}
