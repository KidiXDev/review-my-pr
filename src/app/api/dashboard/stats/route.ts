import { NextResponse } from "next/server";
import { db } from "@/index";
import { githubRepositories, whatsappGroups, webhookEvents } from "@/db/schema";
import { sessionManager } from "@/lib/session-manager";
import { sql, gte, eq, and } from "drizzle-orm";
import { subHours } from "date-fns";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const client = sessionManager.getClient(userId);
    const waStatus = client.getStatus();

    const [repoCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(githubRepositories)
      .where(eq(githubRepositories.userId, userId));

    const [groupCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(whatsappGroups)
      .where(eq(whatsappGroups.userId, userId));

    const twentyFourHoursAgo = subHours(new Date(), 24);

    // Now we can filter webhookEvents directly by userId
    const [eventCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(webhookEvents)
      .where(
        and(
          gte(webhookEvents.createdAt, twentyFourHoursAgo),
          eq(webhookEvents.userId, userId),
        ),
      );

    return NextResponse.json({
      whatsapp: {
        isConnected: waStatus.isConnected,
        isReady: waStatus.isReady,
      },
      repos: {
        total: Number(repoCount?.count || 0),
        active: Number(repoCount?.count || 0),
      },
      groups: {
        total: Number(groupCount?.count || 0),
      },
      events: {
        last24h: Number(eventCount?.count || 0),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
