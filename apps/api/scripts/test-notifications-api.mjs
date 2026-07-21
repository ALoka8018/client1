import "dotenv/config";
import { prisma } from "@repo/database";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../src/lib/notifications.ts";

const suffix = Math.random().toString(36).slice(2, 8);

const user = await prisma.user.create({
  data: {
    supabaseId: `test-notif-api-${suffix}`,
    email: `test-notif-api-${suffix}@example.com`,
    name: "Test Notification Customer",
  },
});

try {
  await prisma.notification.createMany({
    data: [
      { userId: user.id, type: "BOOKING_STATUS_CHANGED", title: "Booking confirmed", body: "Test 1" },
      { userId: user.id, type: "INVOICE_PAID", title: "Payment received", body: "Test 2" },
      { userId: user.id, type: "BOOKING_STATUS_CHANGED", title: "Rescheduled", body: "Test 3" },
    ],
  });

  const before = await listNotifications(user);
  console.log("Notifications count:", before.notifications.length, "unreadCount:", before.unreadCount);

  const firstId = before.notifications[0].id;
  const marked = await markNotificationRead(user, firstId);
  console.log("Marked read:", marked.read === true);

  const afterOneRead = await listNotifications(user);
  console.log("Unread count after marking one:", afterOneRead.unreadCount === 2);

  let rejectedOtherUsers = false;
  const otherUser = await prisma.user.create({
    data: {
      supabaseId: `test-notif-other-${suffix}`,
      email: `test-notif-other-${suffix}@example.com`,
      name: "Other User",
    },
  });
  try {
    await markNotificationRead(otherUser, before.notifications[1].id);
  } catch (err) {
    rejectedOtherUsers = true;
    console.log("Cross-user mark-read rejected:", err.message);
  }
  console.log("Rejected cross-user access:", rejectedOtherUsers);

  const markAllResult = await markAllNotificationsRead(user);
  console.log("Marked all as read, count:", markAllResult.count === 2);

  const afterAll = await listNotifications(user);
  console.log("Unread count after mark-all:", afterAll.unreadCount === 0);

  await prisma.user.delete({ where: { id: otherUser.id } });
} finally {
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log("Cleaned up test data");
  await prisma.$disconnect();
}
