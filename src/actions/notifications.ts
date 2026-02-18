"use server";

import { db } from "@/index";
import { notifications } from "@/db/notification-schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { type NotificationType } from "@/types/notifications";
import { publishUpdate } from "@/lib/pubsub";

export async function getNotifications() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const data = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return data;
}

export async function markNotificationAsRead(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.id, id), eq(notifications.userId, session.user.id)),
    );

  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, session.user.id));

  return { success: true };
}

// Internal helper to trigger notification
export async function triggerNotification(
  userId: string,
  data: {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, unknown>;
  },
) {
  // 1. Save to DB
  const [newNotification] = await db
    .insert(notifications)
    .values({
      userId,
      ...data,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    })
    .returning();

  await publishUpdate(userId, "notification", newNotification);

  return newNotification;
}
