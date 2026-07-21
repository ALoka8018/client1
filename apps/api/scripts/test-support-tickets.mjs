import "dotenv/config";
import { prisma } from "@repo/database";
import { createSupportTicket, listSupportTickets } from "../src/lib/support.ts";

const suffix = Math.random().toString(36).slice(2, 8);

const user = await prisma.user.create({
  data: {
    supabaseId: `test-support-${suffix}`,
    email: `test-support-${suffix}@example.com`,
    name: "Test Support Customer",
  },
});

try {
  const ticket = await createSupportTicket(user, {
    topic: "Invoice question",
    message: "I was charged twice for the same booking, please help.",
  });
  console.log("Ticket created:", ticket.status === "OPEN", ticket.topic === "Invoice question");

  const ticket2 = await createSupportTicket(user, {
    topic: "Reschedule help",
    message: "Need to move my appointment.",
  });

  const tickets = await listSupportTickets(user);
  console.log("List count:", tickets.length === 2);
  console.log("Most recent first:", tickets[0].id === ticket2.id);

  const notifications = await prisma.notification.findMany({ where: { userId: user.id } });
  console.log(
    "Notifications created for each ticket:",
    notifications.length === 2 && notifications.every((n) => n.type === "SUPPORT_TICKET_REPLY"),
  );
} finally {
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.supportTicket.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log("Cleaned up test data");
  await prisma.$disconnect();
}
