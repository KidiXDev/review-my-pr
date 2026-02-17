import { NextResponse } from "next/server";
import { db } from "@/index";
import { githubRepositories, whatsappGroups, webhookEvents } from "@/db/schema";
import { waClient } from "@/lib/whatsapp-client";
import { sql, gte } from "drizzle-orm";
import { subHours } from "date-fns";

export async function GET() {
  try {
    const waStatus = waClient.getStatus();

    const [repoCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(githubRepositories);

    const [groupCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(whatsappGroups);

    const twentyFourHoursAgo = subHours(new Date(), 24);
    const [eventCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(webhookEvents)
      .where(gte(webhookEvents.createdAt, twentyFourHoursAgo));

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
