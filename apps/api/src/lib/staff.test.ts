import { describe, it, expect, vi, beforeEach } from "vitest";

const UserRole = { CUSTOMER: "CUSTOMER", TECHNICIAN: "TECHNICIAN", ADMIN: "ADMIN", SUPER_ADMIN: "SUPER_ADMIN" };
const TechnicianApplicationStatus = { PENDING: "PENDING", APPROVED: "APPROVED", REJECTED: "REJECTED" };

const prisma = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
  technicianProfile: {
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  technicianApplication: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(async (fn: (tx: typeof prisma) => unknown) => fn(prisma)),
};

vi.mock("@repo/database", () => ({ prisma, UserRole, TechnicianApplicationStatus }));
vi.mock("./supabase.js", () => ({
  supabaseAdmin: { auth: { admin: { inviteUserByEmail: vi.fn(), listUsers: vi.fn() } } },
}));
vi.mock("./mailer.js", () => ({ sendMail: vi.fn() }));

const { updateUserAsAdmin } = await import("./staff.js");
const { reviewTechnicianApplication } = await import("./technician-applications.js");

beforeEach(() => {
  vi.clearAllMocks();
  prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => unknown) => fn(prisma));
});

describe("updateUserAsAdmin", () => {
  it("rejects changing your own role", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u1",
      role: UserRole.ADMIN,
      technicianProfile: null,
    });

    await expect(updateUserAsAdmin("u1", "u1", { role: UserRole.SUPER_ADMIN } as never)).rejects.toThrow(
      "Cannot change your own role",
    );
  });

  it("rejects demoting the last remaining super admin", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u2",
      role: UserRole.SUPER_ADMIN,
      technicianProfile: null,
    });
    prisma.user.count.mockResolvedValue(0);

    await expect(updateUserAsAdmin("actor", "u2", { role: UserRole.ADMIN } as never)).rejects.toThrow(
      "Cannot demote the last remaining super admin",
    );
  });

  it("creates a TechnicianProfile when promoting to TECHNICIAN", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "u3",
      role: UserRole.CUSTOMER,
      technicianProfile: null,
    });
    prisma.user.update.mockResolvedValue({
      id: "u3",
      name: "Tech",
      email: "tech@example.com",
      phone: null,
      role: UserRole.TECHNICIAN,
      createdAt: new Date(),
      technicianProfile: { active: true },
    });

    await updateUserAsAdmin("actor", "u3", { role: UserRole.TECHNICIAN } as never);

    expect(prisma.technicianProfile.create).toHaveBeenCalledWith({ data: { userId: "u3" } });
  });
});

describe("reviewTechnicianApplication", () => {
  it("rejects reviewing an application that isn't pending", async () => {
    prisma.technicianApplication.findUnique.mockResolvedValue({
      id: "app1",
      status: TechnicianApplicationStatus.APPROVED,
    });

    await expect(
      reviewTechnicianApplication("app1", { status: "APPROVED" } as never),
    ).rejects.toThrow("Application has already been reviewed");
  });
});
